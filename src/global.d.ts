declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.json' {
  const content: string;
  export default content;
}

// Chrome Extension API types
declare namespace chrome {
  namespace storage {
    namespace local {
      function get(keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void): void;
      function set(items: object, callback?: () => void): void;
    }
  }
  
  namespace tabs {
    function query(queryInfo: object, callback: (tabs: chrome.tabs.Tab[]) => void): void;
    function sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
  }
  
  namespace runtime {
    const onMessage: {
      addListener(callback: (request: any, sender: any, sendResponse: (response?: any) => void) => boolean | void): void;
    };
  }
}
