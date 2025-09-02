import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ margin: '1rem' }}>
  <button onClick={() => changeLanguage('en')}>English</button>
  <button onClick={() => changeLanguage('si')}>සිංහල</button>
  <button onClick={() => changeLanguage('ta')}>தமிழ்</button>
    </div>
  );
};

export default LanguageSwitcher;
