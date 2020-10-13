import "./spinner.css";
import React from "react";

function Spinner(props) {
  return (
    <div className={props.className + " spinner"}>
      <span>•</span>
      <span>•</span>
      <span>•</span>
    </div>
  );
}

Spinner.defaultProps = {};

Spinner.propTypes = {};

export default Spinner;
