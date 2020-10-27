Input = {
  // Calling the Inputs
  Expression: document.querySelector('input#expression'),
  Result: document.querySelector('input#result'),
};
 
Buttons = {
  // Calling the Buttons
  Clear: document.getElementById('clear'),
  Backspace: document.getElementById('back'),
  Operator: document.querySelectorAll('.operator'),
  // Percent: document.querySelector('#percent'),
  Number: document.querySelectorAll('.number'),
  Equals: document.querySelector('#equals'),
};

// Adding eventListeners to the buttons click
Buttons.Number.forEach(button => {
  button.addEventListener('click', function () {
    insert.Number(button.value);
  });
});

Buttons.Operator.forEach(button => {
  button.addEventListener('click', function () {
    insert.Operator(button);
  });
});

// Buttons.Percent.addEventListener('click', function () {
//   insert.Percentage();
// });

Buttons.Clear.addEventListener('click', function () {
  insert.Clear();
});

Buttons.Backspace.addEventListener('click', function () {
  insert.Backspace();
});

Buttons.Equals.addEventListener('click', function () {
  insert.Evaluate();
});

var inputHistory = [];
var mathHistory = [];
var typeList = [];
var inputString = '';
var mathString = '';
var Answer = 0;
var Cleared = false;
var Solve = true;

var getLastInput = function (factor, p) {
  var places;
  if (!p || p == 'last') {
    places = 1;
  } else {
    places = p;
  }
  switch (factor) {
    case 'value':
      return mathHistory.length > places - 1
        ? mathHistory[mathHistory.length - places].value
        : null;
      break;
    case 'type':
      return mathHistory.length > places - 1
        ? mathHistory[mathHistory.length - places].type
        : null;
      break;
    case 'solution':
      return mathHistory.length > places - 1
        ? mathHistory[mathHistory.length - places].solve
        : null;
      break;
    case 'element':
      return mathHistory.length > places - 1
        ? mathHistory[mathHistory.length - places].id
        : null;
      break;
    default:
      break;
  }
};
var insertNum = function (v, t, s) {
  mathHistory.push({
    value: v,
    type: t,
    solve: s,
  });

  if (getLastInput('type', 2) == 'number' && inputHistory.length > 0) {
    var str = String(inputHistory[inputHistory.length - 1]).concat(String(v));
    inputHistory[inputHistory.length - 1] = str.format();
  } else {
    inputHistory.push(v);
  }
  Cleared = false;
  Solve = true;
};

function insertOp(operator) {
  mathHistory.push({
    value: operator.value,
    type: 'operator',
    solve: false,
    id: operator.id,
    sign: operator.sign,
  });

  inputHistory.push(operator.sign);
  Cleared = false;
  Solve = false;
}

var convertMathHistory = function () {
  var str = '';
  for (element in mathHistory) {
    str += `${mathHistory[element].value}`.replace(/,/g, '');
  }
  return str;
};

var convertInputHistory = function () {
  return inputHistory.join('');
};

var formatInputHistory = function () {
  // var numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  for (var elementIndex in inputHistory) {
    var element = inputHistory[elementIndex];
    if (element.length <= 3) {
      element = element;
    } else {
      element.replace(/,/g, '');
      element = element.format();
    }
  }
  return inputHistory;
};

function updateResDisplay(val) {
  if (!val) {
    inputString = convertInputHistory();
    Input.Result.value = inputString;
  } else {
    Input.Result.value = val;
  }
  if (Input.Result.value.length == 0 && Cleared == false) {
    Input.Result.value = '0';
  } else if (Input.Result.value.length == 0 && Cleared == true) {
    Input.Result.value = '';
  }
}

function updateExpDisplay(value) {
  Input.Expression.value = value;
}

function Round(value) {
  if (`${value}`.includes('.') == true) {
    var splitVal = `${value}`.split('.');
    if (splitVal[1].length >= 12 - splitVal[0].length) {
      return math.round(value, 12 - splitVal[0].length);
    } else {
      return value;
    }
  } else {
    return value;
  }
}

function Ans() {
  updateExpDisplay(`Ans=${Answer}`);
}

insert = {
  Operator: function (op, nonButton) {
    if (nonButton === true) {
      var signs = [
        ['*', 'mult', '\u00d7'],
        ['/', 'division', '\u00f7'],
        ['+', 'add', '\u002b'],
        ['-', 'sub', '\u2212'],
      ];
      for (i = 0; i < signs.length; i++) {
        if (op == signs[i][0]) {
          var foundOp = signs[i];
        }
      }
      var operator = {
        value: op,
        type: 'operator',
        solved: false,
        id: foundOp[1],
        sign: foundOp[2],
      };
    } else {
      var operator = {
        value: op.value,
        type: 'operator',
        solved: false,
        id: op.id,
        sign: op.getAttribute('sign'),
      };
    }

    if (getLastInput('solution') == true) {
      Ans();
    }
    if (operator.id == 'sub') {
      Ans();
      // *Note* That Numbers can make a Loop-hole in this case
      if (mathHistory.length == 0 || getLastInput('element') != 'sub') {
        insertOp(operator);
        updateResDisplay();
      }
    } else {
      if (mathHistory.length == 0) {
        return;
      } else if (getLastInput('type') == 'operator') {
        if (getLastInput('element') != 'sub') {
          mathHistory.pop();
          inputHistory.pop();
          insertOp(operator);
          updateResDisplay();
        } else if (
          getLastInput('element') == 'sub' &&
          getLastInput('type', 2) == 'operator'
        ) {
          return;
        } else {
          mathHistory.pop();
          inputHistory.pop();
          insertOp(operator);
          updateResDisplay();
        }
      } else {
        insertOp(operator);
        updateResDisplay();
      }
    }
  },
  Number: function (num) {
    // console.log(getLastInput("type"));
    if (mathHistory.length == 0) {
      Ans();
    }
    if (
      getLastInput('solution') == true ||
      (getLastInput('value') == 0 && mathHistory.length == 1)
    ) {
      mathHistory.length = 0;
      inputHistory.length = 0;
      insertNum(num, 'number', false);
      updateResDisplay();
      Ans();
    } else if (
      (mathHistory.length == 0 && num == '.') ||
      (getLastInput('type') == 'operator' && num == '.')
    ) {
      insertNum(0, 'number', false);
      insertNum(num, 'number', false);
      updateResDisplay();
    } else {
      insertNum(num, 'number', false);
      updateResDisplay();
    }
  },
  Percentage: function () {
    if (getLastInput('type') == 'number') {
      var lastMathNum = [];
      var lastMathNumValues = [];
      var leftSide;
      var newIndex;
      inputHistory.pop();
      while (getLastInput('type') == 'number') {
        lastMathNum.unshift(mathHistory[mathHistory.length - 1]);
        lastMathNumValues.unshift(mathHistory[mathHistory.length - 1].value);
        mathHistory.pop();
      }
      if (lastMathNumValues.includes('.')) {
        newIndex = lastMathNumValues.indexOf('.');
        lastMathNum.splice(newIndex, 1);
        lastMathNum.splice(newIndex, 0, {
          value: '.',
          type: 'number',
          solve: false,
        });
        lastMathNumValues.splice(newIndex, 1);
        lastMathNumValues.splice(newIndex, 0, '.');
      } else {
        newIndex = lastMathNum.length - 2;
        lastMathNum.splice(newIndex, 0, {
          value: '.',
          type: 'number',
          solve: false,
        });
        lastMathNumValues.splice(newIndex, 0, '.');
      }
      lastMathNum.forEach(element => mathHistory.push(element));
      lastInputNumValues = lastMathNumValues.join('').format();
      inputHistory.push(lastInputNumValues);
    } else {
      return;
    }
    updateResDisplay();
  },
  Clear: function () {
    mathHistory.length = 0;
    inputHistory.length = 0;
    Input.Expression.value = '';
    Answer = 0;
    Cleared = true;
    updateResDisplay();
  },
  Backspace: function () {
    if (mathHistory.length > 0) {
      var last = inputHistory[inputHistory.length - 1];
      if (last.length == 1 || getLastInput('solution') == true) {
        inputHistory.pop();
      } else {
        last = last.slice(0, -1);
        inputHistory[inputHistory.length - 1] = last.format();
      }
      mathHistory.pop();
    }
    updateResDisplay();
  },
  Evaluate: function () {
    if (mathHistory.length > 0) {
      if (Solve === true) {
        inputString = convertInputHistory();
        mathString = convertMathHistory();
        var formatedNum =
          math.evaluate(mathString) != 'Infinity'
            ? Round(math.evaluate(mathString)).format()
            : math.evaluate(mathString);
        Answer = math.evaluate(mathString) == 0 ? '0' : formatedNum;
        updateExpDisplay(inputString + '=');
        mathHistory.length = 0;
        inputHistory.length = 0;
        insertNum(Answer, 'number', true);
        updateResDisplay(Answer);
      } else if (Solve === false) {
        updateResDisplay('NO...Wrong');
      }
    } else {
      Ans();
      updateResDisplay(0);
    }
  },
};

document.addEventListener('keyup', function (event) {
  if (event.key >= 0 && event.key <= 9) {
    insert.Number(event.key);
  } else if (event.key == 'Backspace') {
    insert.Backspace();
  } else if (event.key == 'c') {
    insert.Clear();
  } else if (
    event.key == '*' ||
    event.key == '/' ||
    event.key == '+' ||
    event.key == '-'
  ) {
    insert.Operator(event.key, true);
  } else if (event.key == 'Enter' || event.key == '=') {
    insert.Evaluate();
  }
});
/* ----------Other Stuff that helped---------- */
Number.prototype.format = function (spacing) {
  var arr = String(this);
  arr = arr.replace(/,/g, '');
  var array = arr.split('');
  var start;
  var fill;
  if (!spacing) {
    fill = ',';
  } else {
    fill = spacing;
  }
  if (arr.includes('.')) {
    start = arr.split('.')[0];
  } else {
    start = arr;
  }
  var howMany =
    start.length % 3 === 0
      ? parseInt(start.length / 3) - 1
      : parseInt(start.length / 3);
  for (var times = 1; times < howMany + 1; times++) {
    var special = start.length - times * 3;
    array[special] = ','.concat(String(array[special]));
  }
  return array.join('');
};

String.prototype.format = function (spacing) {
  var arr = this;
  arr = arr.replace(/,/g, '');
  var array = arr.split('');
  var start;
  var fill;
  if (!spacing) {
    fill = ',';
  } else {
    fill = spacing;
  }
  if (arr.includes('.')) {
    start = arr.split('.')[0];
  } else {
    start = arr;
  }
  var howMany =
    start.length % 3 === 0
      ? parseInt(start.length / 3) - 1
      : parseInt(start.length / 3);
  for (var times = 1; times < howMany + 1; times++) {
    var special = start.length - times * 3;
    array[special] = ','.concat(String(array[special]));
  }
  return array.join('');
};

String.prototype.splice = function (start, delCount, newSubStr) {
  return (
    this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount))
  );
};
