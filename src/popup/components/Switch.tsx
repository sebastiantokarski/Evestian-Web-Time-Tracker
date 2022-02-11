import React from 'react';

export interface SwitchProps {
  name: string;
  value: boolean;
  config: any;
  handleSettingChange: (event: React.ChangeEvent) => void;
}

const Switch: React.FC<SwitchProps> = ({ name, value, config, handleSettingChange }) => {
  const id = `checkbox-${config.id}`;

  return (
    <label className="switch" htmlFor={id}>
      <input id={id} name={name} type="checkbox" checked={value} onChange={handleSettingChange} />
      <div className="slider round"></div>
    </label>
  );
};

export default Switch;
