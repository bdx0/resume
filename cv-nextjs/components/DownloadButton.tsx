import React from 'react';

interface DownloadButtonProps {
  href: string;
  download?: string;
  children: React.ReactNode;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ href, download, children }) => {
  return (
    <a
      href={href}
      download={download}
      className="inline-flex items-center px-4 py-2 ml-2 bg-blue-500 text-white border-none rounded-md cursor-pointer text-base no-underline transition-colors duration-300 hover:bg-blue-700"
    >
      <svg className="mr-2 w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
      </svg>
      {children}
    </a>
  );
};

export default DownloadButton;