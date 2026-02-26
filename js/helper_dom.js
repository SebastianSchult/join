"use strict";

(function registerHelperDomModule() {
  const hdClearDiv = (id) => {
    return (document.getElementById(id).innerHTML = "");
  };

  const hdDoNotClose = (event) => {
    event.stopPropagation();
  };

  const hdSetAttributes = (element, attrs) => {
    for (const key in attrs) {
      element.setAttribute(key, attrs[key]);
    }
  };

  const hdFindFreeId = (arrayToCheck) => {
    for (let i = 0; i < 1000; i++) {
      let free = true;
      for (let j = 0; j < arrayToCheck.length; j++) {
        if (arrayToCheck[j].id == i) {
          free = false;
        }
      }
      if (free) {
        return i;
      }
    }
    return -1;
  };

  const hdGenerateRandomColor = () => {
    const colors = [
      "#76b852",
      "#ff7043",
      "#ff3333",
      "#3399ff",
      "#ff6666",
      "#33ccff",
      "#ff9933",
      "#66ff66",
      "#0059ff",
      "#a64dff",
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  window.HelperDom = Object.freeze({
    clearDiv: hdClearDiv,
    doNotClose: hdDoNotClose,
    setAttributes: hdSetAttributes,
    findFreeId: hdFindFreeId,
    generateRandomColor: hdGenerateRandomColor,
  });

  window.clearDiv = hdClearDiv;
  window.doNotClose = hdDoNotClose;
  window.setAttributes = hdSetAttributes;
  window.findFreeId = hdFindFreeId;
  window.generateRandomColor = hdGenerateRandomColor;
})();
