import React from "react";
const Button = (props) => {
  return (
    <button onClick={props.onClick}>props.txt2</button>
  )
}


Button.whyDidYouRender = true;
export default React.memo(Button);
