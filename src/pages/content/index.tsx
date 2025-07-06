// Initialize content script
console.log('Content script initializing...');

// Function to get session info from the portal
const getSessionInfo = () => {
  try {
    // If not available, try to parse from script content
    const scripts = document.getElementsByTagName('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      if (content.includes('odoo.__session_info__')) {
        // Extract the JSON object from the script content
        const match = content.match(/odoo\.__session_info__\s*=\s*({[\s\S]*?});/);
        console.log('Match:', match);
        if (match && match[1]) {
          try {
            const sessionInfo = JSON.parse(match[1]);
            return sessionInfo;
          } catch (e) {
            console.error('Error parsing session info:', e);
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting session info:', error);
    return null;
  }
};

// Listen for messages from the popup
// {"uid": 16978, "is_system": false, "is_admin": false, "user_context": {"lang": "vi_VN", "tz": "Asia/Saigon", "uid": 16978}, "db": "bitnami_odoo", "server_version": "15.0-20220510", "server_version_info": [15, 0, 0, "final", 0, ""], "support_url": "https://www.odoo.com/buy", "name": "AnhNT3", "username": "anhnt3@funix.edu.vn", "partner_display_name": "AnhNT3", "company_id": 1, "partner_id": 26944, "web.base.url": "https://portal.funix.edu.vn", "active_ids_limit": 20000, "profile_session": null, "profile_collectors": null, "profile_params": null, "max_file_upload_size": 134217728, "home_action_id": false, "cache_hashes": {"translations": "7fae8ef6713556199263c5dbf3c6687764645fda", "load_menus": "bdc666e09f59bd6182b7794d44489d60eb5f1906cba93e89df262ed0c0019e01", "qweb": "c6b1bed754e48bd09ed07ff42dbe4b35054611c7bb08be29047015d661675595", "assets_discuss_public": "a9e4893f8fd804740fc59ef67dc6e2b992ba7b6f6cc1aa1a29d7e8a1a48d9f60"}, "currencies": {"2": {"symbol": "$", "position": "before", "digits": [69, 2]}, "23": {"symbol": "\u20ab", "position": "after", "digits": [69, 0]}}, "user_companies": {"current_company": 1, "allowed_companies": {"1": {"id": 1, "name": "FUNiX", "sequence": 0}}}, "show_effect": "True", "display_switch_company_menu": false, "user_id": [16978], "notification_type": "email", "odoobot_initialized": true, "theme_background_blend_mode": "normal", "theme_has_background_image": false}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request.type);
  
  if (request.type === 'PING') {
    sendResponse({ success: true, message: 'Content script is ready' });
    return true;
  }

  if (request.type === 'CREATE_TIME_SLOTS') {
    const { selectedDates, startTime, endTime, mentorId } = request.payload;
    const sessionInfo = getSessionInfo();
    if (!sessionInfo) {
      sendResponse({ success: false, error: 'Session info not found' });
      return true;
    }

    if (!mentorId) {
      sendResponse({ success: false, error: 'Mentor ID is required' });
      return true;
    }

    const createTimeSlots = async () => {
      const promises = selectedDates.map(async (date: string) => {
        // Convert local time to UTC
        const localStartDateTime = new Date(`${date}T${startTime}`);
        const localEndDateTime = new Date(`${date}T${endTime}`);
        
        // Format as UTC ISO string and remove the 'Z' suffix to get UTC time without timezone indicator
        const utcStartDateTime = localStartDateTime.toISOString().slice(0, 19).replace('T', ' ');
        const utcEndDateTime = localEndDateTime.toISOString().slice(0, 19).replace('T', ' ');
        
        const payload = {
          id: 19,
          jsonrpc: "2.0",
          method: "call",
          params: {
            args: [{
              mentor_id: mentorId,
              is_available: true,
              start_datetime: utcStartDateTime,
              end_datetime: utcEndDateTime
            }],
            model: "fx.calendar.available_slot",
            method: "create",
            kwargs: {
              context: {
                lang: sessionInfo.user_context.lang,
                tz: sessionInfo.user_context.tz,
                uid: sessionInfo.user_context.uid,
                allowed_company_ids: [sessionInfo.user_companies.current_company],
                search_default_filter_all_available_slot: 1
              }
            }
          }
        };

        try {
          const response = await fetch('https://portal.funix.edu.vn/web/dataset/call_kw/fx.calendar.available_slot/create', {
            method: 'POST',
            headers: {
              'Accept': '*/*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Content-Type': 'application/json',
              'Origin': 'https://portal.funix.edu.vn',
              'Referer': 'https://portal.funix.edu.vn/web',
              'Sec-Fetch-Dest': 'empty',
              'Sec-Fetch-Mode': 'cors',
              'Sec-Fetch-Site': 'same-origin',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
              'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Windows"'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('API response for date', date, ':', result);
          return result;
        } catch (error) {
          console.error('Error for date', date, ':', error);
          throw error;
        }
      });

      try {
        const results = await Promise.all(promises);
        sendResponse({ success: true, results });
      } catch (error: unknown) {
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    };

    createTimeSlots();
    return true; // Required for async sendResponse
  }
});

// Notify that content script is ready
console.log('Content script initialized and ready');