import React from "react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 ml-10">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search Insurance available"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="flex items-center ml-4">
          <button className="mr-4">🔔</button>
          <div className="flex items-center">
            <span className="mr-2">Paul Blessing</span>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              PB
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
