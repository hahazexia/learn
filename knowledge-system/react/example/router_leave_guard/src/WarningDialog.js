import React from 'react';
import './dialog.css'

const WarningDialog = (props) => {
  return (
    <div className={props.open ? 'dialog show' : 'dialog'}>
      <div className='text'>是否跳转到{props.text.slice(1)}页面？</div>
      <div className='btns'>
        <div onClick={props.onCancel}>取消</div>
        <div onClick={props.onConfirm}>确定</div>
      </div>
    </div>
  );
};

export default WarningDialog;
