import React, { useEffect, useState } from 'react';
import { Prompt } from 'react-router-dom';
import WarningDialog from './WarningDialog';

// react-router 文档 https://v5.reactrouter.com/core/api/Prompt
// when 是否启用 Prompt
// navigate 前端路由跳页面方法
// shouldBlockNavigation 判断是否阻塞路由跳转
const RouteLeavingGuard = ({
  when,
  navigate,
  shouldBlockNavigation,
}) => {

  const [modalVisible, setModalVisible] = useState(false); // 是否显示自定义弹窗
  const [lastLocation, setLastLocation] = useState(null); // 将要跳转到的新地址的路有对象
  const [confirmedNavigation, setConfirmedNavigation] = useState(false); // 标示是否可以跳转了（用户点击了弹窗里的确认按钮）

  // 弹窗点击取消就隐藏弹窗
  const closeModal = () => {
    setModalVisible(false);
  };

  // 弹窗点击确认按钮就隐藏弹窗，并且将 confirmedNavigation 设置为 true
  const handleConfirmNavigationClick = () => {
    setModalVisible(false);
    setConfirmedNavigation(true);
  };

  // 父组件的 shouldBlockNavigation 方法调用判断是否将要去的 url 会被阻塞，如果阻塞显示弹窗，并且存下目标路由对象，然后 return false
  const handleBlockedNavigation = (nextLocation) => {
    if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
      setModalVisible(true);
      setLastLocation(nextLocation);
      return false;
    }
    return true;
  };


  // 如果 lastLocation 目标路由对象存在，并且 confirmedNavigation 为 true（说明点击了弹窗确认按钮），就立即跳转到目标路由地址
  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      navigate(lastLocation.pathname);
    }
  }, [confirmedNavigation, lastLocation]);

  return (
    <>
      {/** when 控制是否启用 prompt */}
      {/* message 如果是一个函数 return false 则阻塞跳转，return true 则直接跳转 */}
      <Prompt when={when} message={handleBlockedNavigation} />
      
      {/* EarningDialog 你的自定义弹窗 */}
      <WarningDialog
        open={modalVisible}
        onCancel={closeModal}
        text={lastLocation ? lastLocation.pathname : ''}
        onConfirm={handleConfirmNavigationClick}
      />
    </>
  );
};
export default RouteLeavingGuard;
