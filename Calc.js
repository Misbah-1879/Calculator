const toRadians = (degrees) => (degrees * Math.PI) / 180;
const constants = {
    pi: Math.PI,
    e: Math.E
};
// console.log(constants.pi);
const variables = {};
const history = [];

function displayHistory() {
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = '';

    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = `${item.expression} = ${item.result.toFixed(4)}`;

        historyItem.addEventListener('click', () => {
            const expressionInput = document.getElementById('expressionInputScreen');
            expressionInput.value = item.expression;
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deleteFromHistory(index);
        });

        historyItem.appendChild(deleteButton);
        historyContainer.appendChild(historyItem);
    });
}

function deleteFromHistory(index) {
    history.splice(index, 1);
    displayHistory();
}
const operations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '^': (a, b) => Math.pow(a, b),
    'sqrt': (a) => Math.sqrt(a),
    'cos': (a) => Math.cos(toRadians(a)),
    'sin': (a) => Math.sin(toRadians(a)),
    'tan': (a) => Math.tan(toRadians(a)),
    // Add more functions as needed
};
function setVariable(name, value) {
    if (name.toLowerCase() in constants) {
        throw new Error(`Cannot create variable with the name '${name}' as it conflicts with a constant.`);
    }
    variables[name] = parseFloat(value);
    console.log(variables);
}

function getVariableValue(name) {
    return variables[name] || (name.toLowerCase() in constants ? constants[name.toLowerCase()] : undefined);
}
function expressionCreation(value) {
    const expressionInput = document.getElementById('expressionInputScreen');
    // expressionInput.value += value;
        expressionInput.value += value;
}
document.getElementById('createVariableButton').addEventListener('click', createVariable);
function clearInput() {
    const expressionInput = document.getElementById('expressionInputScreen');
    const outputDisplay = document.getElementById('outputDisplay');
    expressionInput.value = '';
    outputDisplay.textContent = '';
}
//create variables if needed
function createVariable() {
    const name = prompt('Enter variable name:');
    const value = prompt('Enter variable value:');
    
    try {
        setVariable(name, value);
    } catch (error) {
        alert(error.message);
    }
    
}

function calculateResult() {
    // input field with the id "expressionInputScreen" to show expression
    const expressionInput = document.getElementById('expressionInputScreen');
    const outputDisplay = document.getElementById('outputDisplay');
    try {
        const expression = expressionInput.value;
        console.log("expression"+expression);
        const result = calculateExpression(expression);
        console.log(result);
        outputDisplay.textContent = result.toFixed(4);
        addToHistory(expression, result);
      
        
    } catch (error) {
        outputDisplay.textContent = 'Error: ' + error.message;
    }
function addToHistory(expression, result) {
    console.log(typeof(expression));
    console.log(typeof(result));
    history.push({ expression, result });
    console.log(history);
    displayHistory(); 
}
}

function calculateExpression(expression) {
    console.log(expression);
    // Split the input expression into tokens using regular expression
    const tokens = expression.split(/([+\-*/^()])/).filter(token => token !== '');
    console.log(tokens);
    // Shunting Yard Algorithm: Convert infix expression to Reverse Polish Notation (RPN) or you also say postfix expression according to data structure
    const shuntingYard = (tokens) => {
        const outputQueue = [];
        const operatorStack = [];

        const getPrecedence = (operator) => {
            const precedences = {
                'sqrt': 4,
                'cos': 4,
                'sin': 4,
                'tan': 4,
                '^': 3,
                '*': 2,
                '/': 2,
                '+': 1,
                '-': 1,
                '(': 0,
            };

            return precedences[operator] || 0;
        };
        tokens.forEach(token => {
            console.log("token"+token);
            if (!isNaN(parseFloat(token))) {
                // If the token is a number, push it to the output queue
                outputQueue.push(parseFloat(token));
            }
            else if(token in constants)
            {
                //if the token is constant push its value on outputQueue
                outputQueue.push(constants[token]);
                console.log("enter");
            }
            else if(token in variables)
            {
                //if the token is variable push its value on outputQueue
                outputQueue.push(variables[token]);
                console.log("enter");
            }
            else if (token in operations) {
                // If the token is an operator or function, handle it
                while (
                    operatorStack.length > 0 &&
                    getPrecedence(operatorStack[operatorStack.length - 1]) >= getPrecedence(token)
                ) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            } else if (token === '(') {
                // If the token is an open parenthesis, push it onto the operator stack
                operatorStack.push(token);
            } else if (token === ')') {
                // If the token is a close parenthesis, pop operators from the stack
                // and push them to the output queue until an open parenthesis is encountered
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.pop(); // Pop the open parenthesis
            } else if (token.endsWith('(')) {
                // If the token is a function, push it onto the operator stack
                operatorStack.push(token);
            }

            // Handle other cases as needed
        });
        // Pop any remaining operators from the stack to the output queue
        while (operatorStack.length > 0) {
            outputQueue.push(operatorStack.pop());
        }
        console.log("outpuQueue" + outputQueue);
        return outputQueue;

    };
    const evaluateRPN = (rpnTokens) => {
        const stack = [];

        rpnTokens.forEach(token => {
            if (!isNaN(token)) {
                // If the token is a number, push it to the stack
                stack.push(token);
            } else if (token in operations) {
                // If the token is an operator or function, pop operands from the stack,
                // apply the operator or function, and push the result back to the stack
                const operands = [];
                for (let i = 0; i < operations[token].length; i++) {
                    operands.push(stack.pop());
                }
                operands.reverse(); // Reverse to maintain correct order

                // Handle unary functions
                if (operands.length === 1 && operations[token].length === 1) {
                    stack.push(operations[token](operands[0]));
                     // Check for division by zero
                // if (token === '/' && operands[0] === 0) {
                //     throw new Error('Division by zero');
                // } 
            }
                else {
                    stack.push(operations[token](...operands));
                    // if (token === '/' && operands[0] === 0) {
                    //     throw new Error('Division by zero');
                    // } 
                }
            }
        });

        // The final result should be on the top of the stack
        if (stack.length !== 1 || isNaN(stack[0])) {
            throw new Error('Invalid expression');
        }
        console.log("stack: " + stack[0]);
        return stack[0];
    };


    // Apply the Shunting Yard algorithm to get the RPN tokens
    const rpnTokens = shuntingYard(tokens);
    // Evaluate the RPN expression to get the final result
    const result = evaluateRPN(rpnTokens);

    // Check if the result is a finite number
    if (!isFinite(result)) {
        throw new Error('Result is not finite');
    }

    // Return the final result
    return result;

}
function addToHistory(expression, result) {
    history.push({ expression, result });
}

document.addEventListener('DOMContentLoaded', function () {
    displayHistory(); 

});
