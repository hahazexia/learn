import React from 'react';
import RouteLeavingGuard from './RouteLeavingGuard';
import { Link } from 'react-router-dom';

const Form = () => {
  return (
    <div>
      <div>Form 页面</div>
      <div>
        <Link to={'/other'}>跳转到 Other 页面</Link>
      </div>
      <RouteLeavingGuard
        when={true}
        shouldBlockNavigation={(url) => {
          const { pathname } = url;
          if (pathname.includes('other')) {
            return true;
          } else {
            return false;
          }
        }}
        navigate={(url) => {
          window.location.href = url;
        }}
      />
    </div>
  );
};

export default Form;
