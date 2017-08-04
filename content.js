var userName;
var userPath;
var oldUserPath;
var $button;

(function() {
    var $btn = document.createElement('button');
    var btnHoverCss;
    var style;

    $btn.textContent = 'Send to hubSpot';
    $btn.id = 'sendToHubSpot';
    $btn.style.cssText =
        'background-color: #FF5722;' +
        'border: 0;' +
        'border-radius: 2px;' +
        'box-sizing: border-box;' +
        'color: #fff;' +
        'cursor: pointer;' +
        'display: inline-block;' +
        'font-size: 1.7rem;' +
        'font-weight: 600;' +
        'font-family: inherit;' +
        'height: 40px;' +
        'line-height: 40px;' +
        'margin-left: 8px;' +
        'overflow: hidden;' +
        'outline-width: 2px;' +
        'padding: 0 24px;' +
        'position: relative;' +
        'text-align: center;' +
        'text-decoration: none;' +
        'transition-duration: 167ms;' +
        'transition-property: background-color,box-shadow,color;' +
        'transition-timing-function: cubic-bezier(0,0,.2,1);' +
        'vertical-align: middle;' +
        'z-index: 0;';

    btnHoverCss = '#sendToHubSpot:hover {background-color:#d4491d!important}' +
                  '#sendToHubSpot:disabled {background-color: #9E9E9E!important}' +
                  '#sendToHubSpot:disabled:hover {background-color: #607D8B!important}';
    style = document.createElement('style');

    if (style.styleSheet) {
        style.styleSheet.cssText = btnHoverCss;
    } else {
        style.appendChild(document.createTextNode(btnHoverCss));
    }

    document.getElementsByTagName('head')[0].appendChild(style);

    $button = $btn;
})();

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'checkTabUpdate') {
        console.log('checkTabUpdate');
        userPath = msg.tab.url;

        checkExisting(msg.tab.url);
    }
});

function findBtnContainer() {
    return document.getElementsByClassName('pv-top-card-section__actions')[0];
}

function getUserInfo() {
    var $profileWrap = document.getElementsByClassName('pv-profile-section')[0];
    var responseObj;

    if ($profileWrap) {
        userName = $profileWrap.querySelector('.pv-top-card-section__name').textContent;
    }

    responseObj = {
        properties: [
            { property: 'email', value: userName.split(' ')[0] + userName.split(' ')[1] + '@gmail.com'}, // sorry, but i can'\t find user email :\
            { property: 'firstname', value: userName.split(' ')[0] },
            { property: 'lastname', value: userName.split(' ')[1] },
        ],
    };

    console.log(responseObj);

    return JSON.stringify(responseObj);
}

function checkExisting() {
    if (userPath !== oldUserPath) {
        console.log('path is another');
        oldUserPath = userPath;
        $button.disabled = false;
    }
}

function sendContacts(contactData) {
    var xhr = new XMLHttpRequest();

    xhr.open('POST', 'https://api.hubapi.com/contacts/v1/contact/?hapikey=b470f5cf-f915-4744-8edb-0a30bad83250', true);

    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xhr.onreadystatechange = function() {
        console.log('xhr.status', xhr.status);

        if (xhr.status === 200 && xhr.readyState === 4) {
            alert(userName + ' was added to hubspot');
        }

        if (xhr.status === 409 && xhr.readyState === 4) {
            alert(userName + ' already exist in hubspot');
        }
    };

    xhr.send(contactData);
}

function app() {
    console.log('app was initialized')
    var $container = findBtnContainer();

    if ($container) {

        $button.addEventListener('click', function () {
            sendContacts(getUserInfo());
            $button.disabled = true;
        });

        $container.appendChild($button);
    }
}

function addClassNameListener() {
    var waitForClass = setInterval(function() {

        if (document.body.classList.contains('boot-complete')) {
            clearInterval(waitForClass);
            app();
            pageIsLoadedCorrect = true;
        }
    }, 10);
}

document.readyState === 'interactive' || document.readyState === 'complete'
    ? addClassNameListener()
    : document.addEventListener('DOMContentLoaded', addClassNameListener);
