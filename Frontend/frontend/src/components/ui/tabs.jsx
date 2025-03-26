import React, { createContext, useContext } from 'react';

const TabsContext = createContext({
  value: undefined,
  onValueChange: () => { }
});

export const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  // Use the provided value or defaultValue
  const currentValue = value !== undefined ? value : defaultValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }) => {
  return (
    <div className={className || "inline-flex items-center justify-center rounded-md p-1"}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className, onClick }) => {
  const { value: activeValue, onValueChange } = useContext(TabsContext);
  const isActive = value === activeValue;

  const handleClick = (e) => {
    // Call the onValueChange from context
    if (onValueChange) {
      onValueChange(value);
    }

    // Also call the onClick prop if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-white text-teal-600 shadow-sm' : 'text-teal-700 hover:bg-teal-700/10'} ${className}`}
      onClick={handleClick}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }) => {
  const { value: activeValue } = useContext(TabsContext);

  // Only render if this is the active tab
  if (value !== activeValue) {
    return null;
  }

  return (
    <div
      className={`mt-2 ${className || ''}`}
      data-state="active"
    >
      {children}
    </div>
  );
};
