module.exports = {
  setValueOnInputElement: setValueOnInputElement
};

// chrome driver bug
function setValueOnInputElement(inputElement, value) {
  inputElement.clear();
  inputElement.sendKeys(value);
  inputElement.getAttribute('value').then(insertedValue => {
    if (insertedValue !== value) {
      // Failed, must send characters one at a time
      inputElement.clear();
      var i;
      for(i = 0; i < value.length; i++){
        inputElement.sendKeys(value.charAt(i));
      }
    }
  });
}

