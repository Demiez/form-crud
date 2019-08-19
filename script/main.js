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
            input.setAttribute("id", key);
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
                input.setAttribute("id", key);
            }
            this.addErrorBox(label,key);
            input.setAttribute("type", "date");

            let date = `${value.getFullYear()}`;
            date += value.getMonth() < 10 ? `-0${value.getMonth()}` : `-${value.getMonth()}`;
            date += value.getDay() < 10 ? `-0${value.getDay()}` : `-${value.getDay()}`;

            input.setAttribute("value", date);
            input.setAttribute("id", key);
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
            passwordInput.setAttribute("id", key);
            passwordConfirm.setAttribute("type", "text");
            passwordConfirm.setAttribute("id", `confirm-${key}`);
            this.addErrorBox(formBody,'password-confirm');
            return [passwordInput, passwordConfirm];
        }
    };

    // form + h
    let formBody = document.createElement('div');
    formBody.innerHTML = '<h1>Here will be the form</h1>';

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
                console.log(key)
            }
            input.oninput = () => {
                data[key] = input.value;
                if (typeof this.validators[key] == "function") {
                    if (typeof this.validators[key](data[key]) == "string") {
                        console.log("passed")
                        document.getElementById(`${key}-error`).innerText = `${this.validators[key](data[key])}`;
                        data[key] = "";
                    } else {
                        document.getElementById(`${key}-error`).innerText = ``;
                    }
                }
                else {
                    console.log("no validator attached")
                }
                this.validators.highlightMandatory(input);
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
                this.validators.highlightMandatory(input);
                if (typeof this.validators[key] == "function") {
                    if (this.validators[key](input, key)) {
                        data[key] = input.value;
                    } else {
                        data[key] = "";
                    }
                }
            }

        //### Email input + built in regEx validation
        } else if (value.match(emailRegEx)) {
            let input = inputCreators.string(key,value);
            input.oninput = () => {
                this.validators.highlightMandatory(input);
                if (typeof this.validators[key] == "function") {
                    if (this.validators[key](input, key, emailRegEx)) {
                        data[key] = input.value;
                    }
                }
            }
        //### Password input + built in medium strength password validation (6 letters + 1 number or 1 uppercase)
        } else if (value.includes("*")) {
            let input = inputCreators.password(key, value);
            if (key[0] == "*") {
                renameKey(key, key.substring(1), data);
                key = key.substring(1);
            }
            data[key] = "";
            input[0].oninput = () => {
                this.validators.highlightMandatory(input[0]);
                if (typeof this.validators[key] == "function") {
                    if (this.validators[key](input[0], key, passwordRegEx)) {
                        input[1].oninput = () => {
                            console.log("checking pass")
                            if (input[1].value === input[0].value) {
                                document.getElementById(`password-confirm-error`).style['color'] = `green`;
                                document.getElementById(`password-confirm-error`).innerText = ` ok`;
                                data[key] = input[0].value;
                            } else {
                                document.getElementById(`password-confirm-error`).style['color'] = `red`;
                                document.getElementById(`password-confirm-error`).innerText = ` Please confirm password in both fields`;
                            }
                        }
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
            let valid = this.validators.checkMandatory(data);
            if (valid === true) {
                document.getElementById("button-error").style["color"] = `green`;
                document.getElementById("button-error").innerText = `Thanks!`;
                this.okCallback(e)
            } else {
                document.getElementById("button-error").style["color"] = `red`;
                document.getElementById("button-error").innerText = ` Sorry, ${valid} mandatory field(s) left`
            }
        };
    }

    if (typeof cancelCallback === 'function') {
        formBody.appendChild(cancelButton);
        inputCreators.addErrorBox(formBody,'button');
        cancelButton.onclick = (e) => {
            let save = this.getSave();
            for (let [key,value] of Object.entries(save)) {
                if (typeof(value) != "boolean" && !(value instanceof Date)) {
                    document.getElementById(`${key}`).value = value;
                }
                if (value instanceof Date) {
                    let date = `${value.getFullYear()}`;
                    date += value.getMonth() < 10 ? `-0${value.getMonth()}` : `-${value.getMonth()}`;
                    date += value.getDay() < 10 ? `-0${value.getDay()}` : `-${value.getDay()}`;
                    document.getElementById(`${key}`).value = date;
                }
                if (typeof(value) == "boolean") {
                    let array = document.querySelectorAll(`input[name='${key}'`);
                    if (value) {
                        for (let v of array) {
                            if (v.value === "true") v.checked = "true"
                        }
                    } else {
                        for (let v of array) {
                            if (v.value === "false") v.checked = "true"
                        }
                    }
                }
            }
            cancelCallback();
        }
    }
    el.appendChild(formBody);

    var save = {...data};
    console.log(save);
    this.okCallback = okCallback;
    this.cancelCallback = cancelCallback;
    this.data = data;
    this.getSave = () => {
        return save;
    };

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
        password(input, key, passwordRegEx) {
            if (input.value.match(passwordRegEx)) {
                document.getElementById(`${key}-error`).innerText = ``;
                return true;
            } else {
                document.getElementById(`${key}-error`).innerText = ` Your ${key} is not strong enough`;
                return false;
            }
        },

        checkMandatory(data) {
            let mandatory = [...document.querySelectorAll(".mandatory")];
            let number = mandatory.length;
            for (let i = 0; i < mandatory.length; i++) {
                for (let [key,value] of Object.entries(data)) {
                    if (key === mandatory[i].getAttribute("id") && !!value) {
                        number --;
                    }
                }
            }
            console.log(mandatory);
            if (number === 0) {
                return true;
            } else {
                return number;
            }
        },
        highlightMandatory(element) {
            if(element.classList.contains("mandatory")) {
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
    "*birthday": new Date((new Date).getTime() - 86400000 * 30 * 365)
}, () => console.log('ok'), () => console.log('All inputs are canceled.'));


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
