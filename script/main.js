function Form(el, data, okCallback, cancelCallback) {

    // const renameKey = (oldkey,newkey,{ [oldkey] : old, ...others }) => {
    //     return {
    //         [newkey]: old, ...others
    //     };
    // };
    const renameKey = (oldkey,newkey,obj) => {
        obj[newkey] = obj[oldkey];
        delete obj[oldkey];
        return obj;
    };

    const inputCreators = {

        addErrorBox(target,key){
            let errorBox = document.createElement("span");
            let br = document.createElement("br");
            errorBox.setAttribute('id', `${key}-error`);
            target.appendChild(errorBox);
            target.appendChild(br);
        },

        addMandatory(target,key) {
            if (key[0] == "*") {
               let mandatory = document.createElement('span')
               mandatory.innerText = " * ";
               target.appendChild(mandatory);
               return true;
            }
            return false;
        },

        string(key, value){
            let input = document.createElement('input');
            formBody.appendChild(input);
            let mandatory = this.addMandatory(formBody,key);
            if (mandatory) {
                key = key.substring(1);
                input.setAttribute("class", "mandatory");
            }
            this.addErrorBox(formBody,key);
            input.setAttribute("type", "text");
            input.setAttribute("placeholder", key);
            input.value = value;
            return input;
        },

        boolean(key,value) {
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
            return [inputTrue,inputFalse];
        },

        date(key,value) {
            let label = document.createElement('label');
            if (key[0] == "*") {
                formBody.appendChild(label).innerText = `${key.substring(1)}: `;
            } else {
                formBody.appendChild(label).innerText = `${key}: `;
            }

            let input = document.createElement('input');
            label.appendChild(input);
            let mandatory = this.addMandatory(label,key);
            if (mandatory) {
                key = key.substring(1);
                input.setAttribute("class", "mandatory");
            }
            this.addErrorBox(label,key);
            input.setAttribute("type", "date");

            let date = `${value.getFullYear()}`;
            date += value.getMonth() < 10 ? `-0${value.getMonth()}` : `-${value.getMonth()}`;
            date += value.getDay() < 10 ? `-0${value.getDay()}` : `-${value.getDay()}`;

            input.setAttribute("value", date);
            return input;
        },

        password(key,value) {
            let label = document.createElement('label');
            if (key[0] == "*") {
                formBody.appendChild(label).innerText = `${key.substring(1)}: `;
            } else {
                formBody.appendChild(label).innerText = `${key}: `;
            }
            let passwordInput = document.createElement('input');
            label.appendChild(passwordInput);
            let mandatory = this.addMandatory(label,key);
            if (mandatory) {
                key = key.substring(1);
                passwordInput.setAttribute("class", "mandatory");
            }
            this.addErrorBox(formBody,key);


            let label02 = document.createElement('label');
            formBody.appendChild(label02).innerText = `confirm ${key}: `;
            let passwordConfirm = document.createElement('input');
            formBody.appendChild(passwordConfirm);

            passwordInput.setAttribute("type", "text");
            passwordConfirm.setAttribute("type", "text");
            this.addErrorBox(formBody,'password-confirm');
            return [passwordInput, passwordConfirm];
        }
    };

    // form + h
    let formBody = document.createElement('div');
    formBody.innerHTML = '<h1>Here will be the form</h1>'

    // ##### Creating inputs in DOM

    for (let [key, value] of Object.entries(data)) {
        let emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        let passwordRegEx = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

        // ### String inputs + adjustable validation
        if (typeof value == "string" && !value.match(emailRegEx) && !value.includes("*")) {
            let input = inputCreators.string(key,value);
            // console.log(key[0], data);
            if (key[0] == "*") {
                renameKey(key, key.substring(1), data);
                key = key.substring(1);
            }
            input.oninput = () => {
                data[key] = input.value;
                if (typeof this.validators[key] == "function") {
                    if (typeof this.validators[key](data[key]) == "string") {
                        document.getElementById(`${key}-error`).innerText = `${this.validators[key](data[key])}`;
                    } else {
                        document.getElementById(`${key}-error`).innerText = ``;
                    }
                } else {
                    console.log("no validator attached")
                }
            }

        //### Boolean inputs
        } else if (typeof value == "boolean") {
            let input = inputCreators.boolean(key,value);
            for (let i = 0; i<input.length; i++) {
                input[i].onchange = () => {
                    data[key] = input[i].value;
                }
            }

        //### Date inputs + built-in validation
        } else if (value instanceof Date) {
            let input = inputCreators.date(key,value);
            if (key[0] == "*") {
                renameKey(key, key.substring(1), data);
                key = key.substring(1);
            }
            input.oninput = () => {
                if (typeof this.validators[key] == "function") {
                    if (this.validators[key](input, key)) {
                        data[key] = input.value;
                    }
                }
            }

        //### Email input + built in regEx validation
        } else if (value.match(emailRegEx)) {
            let input = inputCreators.string(key,value);
            input.oninput = () => {
                if (typeof this.validators[key] == "function") {
                    if (this.validators[key](input, key, emailRegEx)) {
                        data[key] = input.value;
                    }
                }
            }
        } else if (value.includes("*")) {
            let input = inputCreators.password(key,value);
            if (key[0] == "*") {
                renameKey(key, key.substring(1), data);
                key = key.substring(1);
            }
            for (i of input)
                console.log(key)
                i.oninput = () => {
                    console.log(key)
                    if (typeof this.validators[key] == "function") {
                        console.log("!!");
                        if (i == passwordInput)
                        if (this.validators[key](input, key, passwordRegEx)) {
                            data[key] = input.value;
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
        okButton.onclick = (e) => { // arrow function keeps this (is hidden bind)
            this.okCallback(e)
        };
    }

    if (typeof cancelCallback === 'function') {
        formBody.appendChild(cancelButton);
        cancelButton.onclick = cancelCallback
    }
    el.appendChild(formBody);

    this.okCallback = okCallback;
    this.cancelCallback = cancelCallback;
    this.data = data;

    this.validators = {
        "e-mail"(input, key, emailRegEx) {
            if (input.value.match(emailRegEx)) {
                document.getElementById(`${key}-error`).innerText = ``;
                return true;
            } else {
                document.getElementById(`${key}-error`).innerText = ` Wrong ${key}`;
                return false;
            }
        },
        birthday(input, key) {
            if (new Date(input.value).getFullYear() < 1900 || new Date(input.value).getFullYear() > new Date().getFullYear()) {
                document.getElementById(`${key}-error`).innerText = ` Wrong ${key}`;
                return false;
            }
            document.getElementById(`${key}-error`).innerText = ``;
            return true;
        },
        // password(input, key) {
        //     console.log(key)
        // }

    }

}


let form  = new Form (formContainer, {
    "name": 'Anakin',
    "*surname": 'Skywalker',
    "*password": '***',
    "e-mail": 'skywalker@yahoo.com',
    married: true,
    "*birthday": new Date((new Date).getTime() - 86400000 * 30 * 365)
}, () => console.log('ok'), () => console.log('cancel'));


console.log(form.data);
form.okCallback = () => console.log(form.data);

//form.validators.name = (value, key, data, input) => value[0].toUpperCase() == value[0] && !value.includes(' ') && value.length > 2 ? true : 'Wrong name'

form.validators.name = (value, key, data, input) =>
    value.length > 2 &&
    value[0].toUpperCase() == value[0] &&
    !value.includes(' ') ? true : ' Wrong name';

form.validators.surname = (value, key, data, input) =>
    value.length > 2 &&
    value[0].toUpperCase() == value[0] &&
    !value.includes(' ') ? true : ' Wrong surname';
