function Form(el, data, okCallback, cancelCallback) {

    var save = {...data};
    this.inputs = [];
    this.okCallback = okCallback;
    this.cancelCallback = cancelCallback;
    this.data = data;
    this.getSave = () => {
        return save;
    };

    const renameKey = (oldkey,newkey,obj) => {
        obj[newkey] = obj[oldkey];
        delete obj[oldkey];
        return obj;
    };

    const inputCreators = {

        addErrorSpan(){
            formBody.appendChild(document.createElement('span'));
            formBody.appendChild(document.createElement('br'));
        },

        string(key, value, inputs){
            let label = document.createElement('label');
            let input = document.createElement('input');
            formBody.appendChild(label);
            label.appendChild(input);
            if (key[0] == "*") {
                label.setAttribute('content', '*');
                key = key.substring(1);
            }
            this.addErrorSpan();
            input.setAttribute("type", "text");
            input.setAttribute("placeholder", key);
            input.value = value;
            inputs.push(input);
            return input;
        },

        boolean(key,value,inputs) {
            let radioDiv = document.createElement('div');
            formBody.appendChild(radioDiv).innerHTML = `${key}: `;
            let labelTrue = document.createElement('label');
            radioDiv.appendChild(labelTrue);
            labelTrue.innerText = "Yes";
            let inputTrue = document.createElement('input');
            inputTrue.setAttribute("type", "radio");
            inputTrue.setAttribute("name", key);
            inputTrue.setAttribute("value", "true");
            labelTrue.appendChild(inputTrue);


            let labelFalse = document.createElement('label');
            radioDiv.appendChild(labelFalse);
            labelFalse.innerText = "No";
            let inputFalse = document.createElement('input');
            labelFalse.appendChild(inputFalse);
            inputFalse.setAttribute("type", "radio");
            inputFalse.setAttribute("name", key);
            inputFalse.setAttribute("value", "false");
            if (value) {
                inputTrue.setAttribute("checked", "true")
            } else {
                inputFalse.setAttribute("checked","true")
            }
            inputs.push(inputTrue,inputFalse);
            return [inputTrue,inputFalse];
        },

        date(key,value,inputs) {
            let label = document.createElement('label');
            let input = document.createElement('input');
            if (key[0] == "*") {
                key = key.substring(1);
                label.setAttribute('content', '*');
            }
            formBody.appendChild(label).innerText = `${key}: `;

            this.addErrorSpan();
            label.appendChild(input);
            input.setAttribute("type", "date");

            let date = `${value.getFullYear()}`;
            date += value.getMonth() < 10 ? `-0${value.getMonth()}` : `-${value.getMonth()}`;
            date += value.getDate() < 10 ? `-0${value.getDate()}` : `-${value.getDate()}`;

            input.setAttribute("value", date);
            inputs.push(input);
            return input;
        },

        password(key,value,inputs) {
            let label = document.createElement('label');
            let input = document.createElement('input');
            if (key[0] == "*") {
                key = key.substring(1);
                label.setAttribute('content', '*');
            }
            formBody.appendChild(label); // .innerText = `${key}: `
            this.addErrorSpan();
            label.appendChild(input);
            input.setAttribute("type", "text");
            input.setAttribute("placeholder", key);
            inputs.push(input);
            return input;
        }
    };

    // form + h
    let formBody = document.createElement('div');
    formBody.innerHTML = '<h1>Here will be the form</h1>';

    // ##### Creating inputs in DOM

    for (let [key, value] of Object.entries(data)) {
        let emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

        // ### String inputs + adjustable validation
        if (typeof value == "string" && !value.match(emailRegEx) && !value.includes("*")) {
            let input = inputCreators.string(key,value,this.inputs,this.mandatory,this.errorBoxes);

            if (key[0] == "*") {
                renameKey(key, key.substring(1), data);
                key = key.substring(1);
            }

            input.oninput = () => {
                data[key] = input.value;
                if (typeof this.validators[key] == "function") { // Проверяем есть ли валидатор

                    if (typeof this.validators[key](data[key]) == "string") {
                        input.parentElement.nextSibling.innerText = `${this.validators[key](data[key])}`;
                        data[key] = "";
                    } else {
                        input.parentElement.nextSibling.innerText = ``;
                    }
                }
                else {
                    console.log("no validator attached")
                }
                this.validators.highlightMandatory(input);
            }

        //### Boolean inputs
        } else if (typeof value == "boolean") {
            let input = inputCreators.boolean(key,value,this.inputs);
            for (let i = 0; i<input.length; i++) {
                input[i].onchange = () => {
                    data[key] = input[i].value;
                }
            }

        //### Date inputs + built-in validation
        } else if (value instanceof Date) {
            let input = inputCreators.date(key,value, this.inputs);
            if (key[0] == "*") {
                renameKey(key, key.substring(1), data);
                key = key.substring(1);
            }
            input.oninput = () => {
                this.validators.highlightMandatory(input);
                if (typeof this.validators[key] == "function") {
                    if (this.validators[key](input, key)) {
                        data[key] = input.value;
                        input.parentElement.nextSibling.innerText = '';
                    } else {
                        data[key] = "";
                        input.parentElement.nextSibling.innerText = ` Wrong ${key}`;
                    }
                }
            }

        //### Email input + built in regEx validation
        } else if (typeof(value) != "object" && value.match(emailRegEx)) {
            let input = inputCreators.string(key, value, this.inputs);
            if (key[0] == "*") {
                renameKey(key, key.substring(1), data);
                key = key.substring(1);
            }
            input.oninput = () => {
                this.validators.highlightMandatory(input);
                if (typeof this.validators[key] == "function") {
                    if (this.validators[key](input, key, emailRegEx)) {
                        input.parentElement.nextSibling.innerText = ``;
                        data[key] = input.value;
                    } else {
                        input.parentElement.nextSibling.innerText = ` Wrong ${key}`;
                    }
                }
            }
        //### Password input + medium strength password validation (6 letters + 1 number or 1 uppercase)
        } else if (value.includes("*")) {
            let input = inputCreators.password(key, value,this.inputs);
            if (key[0] == "*") {
                renameKey(key, key.substring(1), data);
                key = key.substring(1);
            }
            data[key] = "";
            input.oninput = () => {
                this.validators.highlightMandatory(input);
                if (typeof this.validators[key] == "function") {
                    if (this.validators[key](input, key)) {
                        input.parentElement.nextSibling.innerText = ``;
                        data[key] = input.value;
                    } else {
                        input.parentElement.nextSibling.innerText = ` Your ${key} is not strong enough`;
                    }
                }
            }
        }
    }

    // ### Buttons
    let okButton = document.createElement('button');
    okButton.innerHTML = 'OK';


    let cancelButton = document.createElement('button');
    cancelButton.innerHTML = 'Cancel';

    if (typeof okCallback === 'function') {
        formBody.appendChild(okButton);
        okButton.onclick = (e) => {// arrow function keeps this (is hidden bind)
            let valid = this.validators.checkMandatory(data,this.inputs);
            if (valid === true) {
                okButton.nextSibling.nextSibling.style["color"] = `green`;
                okButton.nextSibling.nextSibling.innerText = `Thanks!`;
                this.okCallback(e)
            } else {
                okButton.nextSibling.nextSibling.style["color"] = `red`;
                okButton.nextSibling.nextSibling.innerText = ` Sorry, ${valid} mandatory field(s) left`
            }
        };
    }

    if (typeof cancelCallback === 'function') {
        formBody.appendChild(cancelButton);
        inputCreators.addErrorSpan();
        cancelButton.onclick = (e) => {
            let save = this.getSave();
            for (let item of this.inputs) { //clears all red notifications
                if (item.type != "radio") {
                    item.parentElement.nextSibling.innerText = '';
                    item.style["box-shadow"] = "";
                }
            }
            for (let [key,value] of Object.entries(save)) {
                if (typeof(value) != "boolean" && !(value instanceof Date)) {
                    for(let item of this.inputs) {
                        if (item.getAttribute('placeholder') === key.substring(1) || item.getAttribute('placeholder') === key) {
                            item.value = value;
                            if (value.includes("*")) item.value = "";
                        }
                    }
                }
                if (value instanceof Date) {
                    let date = `${value.getFullYear()}`;
                    date += value.getMonth() < 10 ? `-0${value.getMonth()}` : `-${value.getMonth()}`;
                    date += value.getDate() < 10 ? `-0${value.getDate()}` : `-${value.getDate()}`;
                    for(let item of this.inputs) {
                        if (item.parentElement.innerText.includes(key.substring(1))) {
                            item.value = date;
                        }
                    }
                }
                if (typeof(value) == "boolean") {
                    console.log(this.inputs);
                    for(let item of this.inputs) {
                        if(item.name === key && item.getAttribute("value") == value.toString()) {
                            item.checked = "true"
                        }
                    }
                }
            }
            cancelCallback();
        }
    }
    el.appendChild(formBody);

    // validators can be assigned to form through form.validators.<name>
    this.validators = {
        name(value, key, data, input){
            if (value.length > 2 && value[0].toUpperCase() == value[0] && !value.includes(' ')) {
                return true;
            } else {
                return ' Wrong name';
            }
        },
        surname(value, key, data, input){
            if (value.length > 2 && value[0].toUpperCase() == value[0] && !value.includes(' ')) {
                return true;
            } else {
                return ' Wrong surname';
            }
        },
        "e-mail"(input, key, emailRegEx) {
            return !!input.value.match(emailRegEx);
        },
        birthday(input, key) {
            return !!!(new Date(input.value).getFullYear() < 1900 || new Date(input.value).getFullYear() > new Date().getFullYear());

        },
        password(input, key) {
            let passwordRegEx = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
            return !!input.value.match(passwordRegEx);
        },

        checkMandatory(data, inputs) {
            let number = 0;
            for (let item of inputs) {
                if (item.parentElement.getAttribute('content') === "*" && !!!item.value) {
                    number ++
                }
            }

            if (number === 0) {
                return true;
            } else {
                return number;
            }
        },
        highlightMandatory(element) {
            if(element.parentElement.getAttribute('content') === "*") {
                if(!element.value) {
                    element.style["box-shadow"] = "2px -1px 1px 0px rgba(255,0,0,1)";
                } else {
                    element.style["box-shadow"] = "";
                }
            }
        }

    }

}


let form  = new Form (formContainer, {
    "*name": 'Anakin',
    "*surname": 'Skywalker',
    "*password": '***',
    "e-mail": 'skywalker@yahoo.com',
    married: true,
    hasDog: false,
    "*birthday": new Date((new Date).getTime() - 86400000 * 30 * 365)
}, () => console.log(form.data), () => console.log('All inputs are canceled.'));

let form02  = new Form (formContainer, {
    "*name": 'Darth',
    "*surname": 'Vader',
    "*password": '***',
    "*e-mail": 'death-star@gmail.com',
    isEvil: true,
    "birthday": new Date((new Date).getTime() - 86400000 * 55 * 365)
}, () => console.log(form02.data), () => console.log('All inputs are canceled.'));


// form.validators.name = (value, key, data, input) =>
//     value.length > 2 &&
//     value[0].toUpperCase() == value[0] &&
//     !value.includes(' ') ? true : ' Wrong name';
