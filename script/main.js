function Form(el, data, okCallback, cancelCallback) {

    const inputCreators = {
        string(key, value){
            let input = document.createElement('input');
            formBody.appendChild(input);
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
            let inputTrue = document.createElement('input')
            inputTrue.setAttribute("type", "radio");
            inputTrue.setAttribute("name", key);
            inputTrue.setAttribute("value", "true");
            labelTrue.appendChild(inputTrue);


            let labelFalse = document.createElement('label');
            radioDiv.appendChild(labelFalse);
            labelFalse.innerText = "No";
            let inputFalse = document.createElement('input')
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
            formBody.appendChild(label).innerText = `${key}: `;
            let input = document.createElement('input');
            label.appendChild(input);
            input.setAttribute("type", "date");

            let date = `${value.getFullYear()}`;
            date += value.getMonth() < 10 ? `-0${value.getMonth()}` : `-${value.getMonth()}`;
            date += value.getDay() < 10 ? `-0${value.getDay()}` : `-${value.getDay()}`;

            input.setAttribute("value", date);
            return input;
        },

        // email(key,value) {
        //     let input = document.createElement('input');
        //     formBody.appendChild(input);
        //     input.setAttribute("placeholder", key);
        //     input.value = value;
        //     return input;
        // }
    };

    // form + h
    let formBody = document.createElement('div');
    formBody.innerHTML = '<h1>Here will be the form</h1>'

    // inputs

    for (let [key, value] of Object.entries(data)) {
        let emailRegEx = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

        if (typeof value == "string" && !value.match(emailRegEx)) {
            let input = inputCreators.string(key,value);
            input.oninput = () => {
                data[key] = input.value;
                if (typeof this.validators[key] == "function") {
                    if (typeof this.validators[key](data[key]) == "string") {
                        input.style["background"] = "red";
                    } else {
                        input.style["background"] = "lightgreen";
                    }
                } else {
                    console.log("no validator attached")
                }
            }

        } else if (typeof value == "boolean") {
            let input = inputCreators.boolean(key,value);
            for (let i = 0; i<input.length; i++) {
                input[i].onchange = () => {
                    data[key] = input[i].value;
                }
            }

        } else if (value instanceof Date) {
            let input = inputCreators.date(key,value);
            input.oninput = () => {
                data[key] = input.value;
                new Date(input.value).getFullYear() < 1980 ? input.style["background"] = "red" : input.style["background"] = "white";
            }

        } else if (value.match(emailRegEx)) {
            let input = inputCreators.string(key,value);
            input.oninput = () => {
                if (typeof this.validators[key] == "function") {
                    console.log("!");
                    if (this.validators[key](input,emailRegEx)) {
                        data[key] = input.value;
                    }
                }
                // !input.value.match(emailRegEx) ? input.style["background"] = "red" : input.style["background"] = "white";
            }
        }
    }


    let okButton = document.createElement('button');
    okButton.innerHTML = 'OK';


    let cancelButton = document.createElement('button');
    cancelButton.innerHTML = 'Cancel';

    if (typeof okCallback === 'function') {
        formBody.appendChild(okButton);
        okButton.onclick = (e) => { // arrow function keeps this (is hidden bind)
            this.okCallback(e)
        };

        // let me = this
        // okButton.onclick = (e) => { // arrow function keeps this (is hidden bind)
        //     me.okCallback(e)
        // }
    }

    if (typeof cancelCallback === 'function') {
        formBody.appendChild(cancelButton);
        cancelButton.onclick = cancelCallback
    }
    el.appendChild(formBody);

    this.okCallback = okCallback
    this.cancelCallback = cancelCallback
    this.data = data;
    this.validators = {
        "e-mail"(input, emailRegEx) {
            if (input.value.match(emailRegEx)) {
                input.style["background"] = "white";
                return true;
            } else {
                input.style["background"] = "red";
                return false;
            }
        },

    }

}


let form  = new Form (formContainer, {
    name: 'Anakin',
    surname: 'Skywalker',
    "e-mail": 'skywalker@yahoo.com',
    married: true,
    birthday: new Date((new Date).getTime() - 86400000 * 30 * 365)
}, () => console.log('ok'), () => console.log('cancel'));


console.log(index.data);
index.okCallback = () => console.log(index.data);

//form.validators.name = (value, key, data, input) => value[0].toUpperCase() == value[0] && !value.includes(' ') && value.length > 2 ? true : 'Wrong name'

index.validators.name = (value, key, data, input) =>
    value.length > 2 &&
    value[0].toUpperCase() == value[0] &&
    !value.includes(' ') ? true : 'Wrong name'

index.validators.surname = (value, key, data, input) =>
    value.length > 2 &&
    value[0].toUpperCase() == value[0] &&
    !value.includes(' ') ? true : 'Wrong name'
