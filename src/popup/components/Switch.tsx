import React from 'react';

export interface SwitchProps {
  name: string;
  value: boolean;
  config: any;
  handleSettingChange: (event: React.ChangeEvent) => void;
}

function Switch({ name, value, config, handleSettingChange }: SwitchProps) {
  const id = `checkbox-${config.id}`;

  return (
    <label className="switch" htmlFor={id}>
      <input id={id} name={name} type="checkbox" checked={value} onChange={handleSettingChange} />
      <div className="slider round" />
    </label>
  );
}

export default Switch;
