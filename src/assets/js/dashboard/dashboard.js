
overrideLoading('dashboard');

let dashboardHasChanges = false;
let startSaving = false;
let dashboardTryingToSave = false;
let savedIcon, savedAnim, savedFadeOut, dragging;

function setFlagForChanges() {
    dashboardHasChanges = true;
    savedIcon.fadeOut(200);
}

function limitText(text) {
    let newText = text.length > 30 ? text.replace(/^(.{30}[^\s]*).*/, '$1...') : text;
    return newText.replace('...', '') === text ? text : newText;
}

function limitText80(text) {
    let newText = text.length > 80 ? text.replace(/^(.{80}[^\s]*).*/, '$1...') : text;
    return newText.replace('...', '') === text ? text : newText;
}

function addFullViewNode(iconPath, nodeClass, text, id, x = mouse.x, y = mouse.y) {
    const parent = $('#dashboard__full-view');
    const fullViewButtons = $('#dashboard__full-view #dashboard__buttons');
    $(`
    <div id="${id}" class="draggable dashboard__draggable ${nodeClass}-wrapper" style="left:${x - parent.offset().left - 50}px;top:${y - parent.offset().top - 50}px">
        <div class="${nodeClass}">
            <div class="dashboard__counter">0</div>
            <div class="dashboard__pin"><i class="fas fa-thumbtack"></i></div>
            <div class="dashboard__remove"><i class="fas fa-times"></i></div>
            <img src="${iconPath}">
        </div>
        <span class="dashboard__text"></span>
    </div>
    `).insertBefore(fullViewButtons);
    $(`#${id} .dashboard__text`).text(limitText(text));
    $(`#${id} .dashboard__pin`).click(function(e) {
        e.preventDefault();
        $(this).toggleClass('active');
        let node = card.find(id);
        if (!node) node = folder.find(id);
        node.pinned = $(this).hasClass('active');
        return false;
    });
    $(`#${id} .dashboard__remove`).click(function(e) {
        e.preventDefault();
        notify.me({
            subheader: `Delete \"${$(this).parent().parent().find('.dashboard__text').text()}"`,
            body: 'Are you sure you want to delete this?',
            fadeInDuration: 200,    
            fadeOutDuration: 300,
            closeButton: false,
            buttons: [{
                text: 'Yes',
                class: 'medium',
                action: () => {
                    let nodeWrapper = $(this).parent().parent();
                    nodeWrapper.fadeOut(200, 'swing', () => nodeWrapper.remove());
                    let f = folder.find(nodeWrapper.attr('id'));
                    let c = card.find(nodeWrapper.attr('id'));
                    if (f) { // If the node we're removing is a folder...
                        folder.delete(f.id);
                    } else if (c) { // If the node we're removing is a card...
                        card.delete(c.id);
                    }
                },
                close: true
            }, { 
                text: 'No',
                class: 'medium',
                action: () => {},
                close: true
            }]
        });
        return false;
    });
}

function getDateFromCardDateTime(cardId) {
    let c = card.find(cardId);
    if (c.date) {
        let dateArray = c.date.split(/\D/);
        let timeArray = c.time.split(':');
        let date;
        if (c.time)
            date = new Date(dateArray[0], --dateArray[1], dateArray[2], timeArray[0], timeArray[1], 0);
        else
            date = new Date(dateArray[0], --dateArray[1], dateArray[2], 10, 0, 0);

        return date;
    }
    return null;
}

function setSneakPeekNodeDateTime(cardId) {
    let c = card.find(cardId);
    if (c.date) {
        let date = getDateFromCardDateTime(cardId);

        let tomorrowDate = new Date();
        let todayDate = new Date(tomorrowDate);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        let isDueToday = date.getFullYear() === todayDate.getFullYear() &&
            date.getMonth() === todayDate.getMonth() &&
            date.getDate() === todayDate.getDate();
        let isDueTomorrow = date.getFullYear() === tomorrowDate.getFullYear() &&
            date.getMonth() === tomorrowDate.getMonth() &&
            date.getDate() === tomorrowDate.getDate();
        let time;
        let minutes = date.getMinutes() + '';
        if (date.getMinutes() < 10)
            minutes = '0' + minutes;
        if (date.getHours() === 0)
            time = `12:${minutes} AM`;
        else if (date.getHours() < 12 && date.getHours() > 0)
            time = `${date.getHours()}:${minutes} AM`;
        if (date.getHours() >= 12) 
            time = `${date.getHours() - 12}:${minutes} PM`;
        $(`#dashboard__sneak-peek__node__${cardId} .due-date-time`).text(`${isDueToday ? 'Today' : (isDueTomorrow ? 'Tomorrow' : (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear())}${c.time ? ' at ' + time : ''}`);
        if (!$('#dashboard__sneak-peek').hasClass('nothing-due') && $('#dashboard__sneak-peek').children().length > 1) {
            let originalHtml;
            if ($(`#dashboard__sneak-peek__node__${cardId}`).length) {
                originalHtml = $(`#dashboard__sneak-peek__node__${cardId}`).html();
                $(`#dashboard__sneak-peek__node__${cardId}`).remove();
            }
            let addingDate = new Date(date);
            let previousNode;
            let children = $('#dashboard__sneak-peek').children('.dashboard__sneak-peek__node').not('#dashboard__sneak-peek__nothing-due').not(`#dashboard__sneak-peek__node__${cardId}`);
            children.each(function() {
                let cardFromNodeId = card.find($(this).attr('id').replace('dashboard__sneak-peek__node__', ''));
                let targetDate = getDateFromCardDateTime(cardFromNodeId.id);
                if (addingDate >= targetDate) {
                    previousNode = $(this).attr('id');
                }
            });
            if (originalHtml) {
                if (previousNode)
                    $('#' + previousNode).after(`
                    <div id="dashboard__sneak-peek__node__${cardId}" class="dashboard__sneak-peek__node">
                        ${originalHtml}
                    </div>`);
                else
                    $('#dashboard__sneak-peek').prepend(`
                    <div id="dashboard__sneak-peek__node__${cardId}" class="dashboard__sneak-peek__node">
                        ${originalHtml}
                    </div>`);
                $(`#dashboard__sneak-peek__node__${cardId}`).hover(function() {
                    $(this).addClass('banner'); 
                    let cardId = $(this).attr('id').replace('dashboard__sneak-peek__node__', '');
                    let c = card.find(cardId);
                    if (c.currentFolderId) {
                        $('#' + c.currentFolderId + ' .dashboard__folder').addClass('hovered');
                    }
                    $('#' + cardId + ' .dashboard__card').addClass('hovered');
                }, function() {
                    $(this).removeClass('banner');
                    let cardId = $(this).attr('id').replace('dashboard__sneak-peek__node__', '');
                    let c = card.find(cardId);
                    if (c.currentFolderId) {
                        $('#' + c.currentFolderId + ' .dashboard__folder').removeClass('hovered');
                    }
                    $('#' + cardId + ' .dashboard__card').removeClass('hovered');
                });
                registerCardClickEvent(cardId, `dashboard__sneak-peek__node__${cardId}`);
            }
        }
    }
    setSneakPeekNodeName(cardId);
}

function setSneakPeekNodeName(cardId) {
    let c = card.find(cardId);
    let flags = '';
    if (c.priorityFlags.includes('star'))
        flags += '<i class="fas fa-star"></i> ';
    if (c.priorityFlags.includes('flag'))
        flags += '<i class="fas fa-flag"></i> ';
    if (c.priorityFlags.includes('exclamation'))
        flags += '<i class="fas fa-exclamation-triangle"></i> ';
    if (c.priorityFlags.includes('question'))
        flags += '<i class="fas fa-question-circle"></i> ';
    if (c.priorityFlags.includes('info'))
        flags += '<i class="fas fa-info-circle"></i> ';
    $(`#dashboard__sneak-peek__node__${cardId} .name .flags`).html(flags);
    $(`#dashboard__sneak-peek__node__${cardId} .name`).css('border-left', `3px solid ${c.color}`);
    $(`#dashboard__sneak-peek__node__${cardId} .name .priority`).text(c.priorityNumber > 0 ? ' - ' + c.priorityNumber : '');
    $(`#dashboard__sneak-peek__node__${cardId} .name .folder`).text(c.currentFolderId ? `${limitText80(folder.find(c.currentFolderId).name)} ⮞` : '');
}

function addSneakPeekNode(cardId) {
    let c = card.find(cardId);
    if (c.date && !$(`#dashboard__sneak-peek__node__${cardId}`).length) {
        $('#dashboard__sneak-peek').removeClass('nothing-due');

        $('#dashboard__sneak-peek').append(`
            <div id="dashboard__sneak-peek__node__${cardId}" class="dashboard__sneak-peek__node">
                <span class="name" style="border-left: 3px solid ${c.color}">
                    <span class="folder">
                        ${
                            c.currentFolderId ? 
                            `${limitText80(folder.find(c.currentFolderId).name)} ⮞`
                            : ''
                        }
                    </span>
                    <span class="inner">
                        ${c.name}
                    </span>
                    <span class="priority">
                        ${c.priorityNumber ? ' - ' + c.priorityNumber : ''}
                    </span>
                    <span class="flags">
                    </span>
                </span>
                <span class="due-date-time">
                </span>
            </div>
        `);
    }
    setSneakPeekNodeDateTime(cardId, true);
}

function registerFolderClickEvent(folderId) {
    $('#' + folderId).click(function() {
        let dragging = $(this).attr('dragging');
        if (dragging && dragging === 'true')
        {
            $(this).attr('dragging', 'false');
            return;   
        }
        // Start building the "modify folder" pop-up.
        const f = folder.find(this.id);
        if (f.cards.length > 0) {
            notify.me({
                header: `Modify "${f.name}"`,
                subheader: 'Enter a new name and description',
                class: 'notify-popup dashboard__modify-popup',
                body: `
                <div class="dashboard__modify-popup__path-wrapper">
                    <div class="dashboard__modify-popup__path">
                        <div class="folder">${limitText80(f.name)}</div>
                    </div>
                </div>
                <div class="dashboard__modify-folder-container">
                    <div class="dashboard__modify-folder-name banner">
                        <div class="textbox">
                            <input type="text" name="name" autocomplete="off" required value="${f.name}">
                            <label for="name">
                                <span>Name</span>
                            </label>
                        </div>
                    </div>
                    <div class="dashboard__modify-folder-description-with-cards banner">
                        <div class="quill-wrapper" id="${f.id}-description-wrapper">
                            <div class="toolbar" id="${f.id}-toolbar">
                                <span class="ql-formats">
                                    <button class="ql-bold"></button>
                                    <button class="ql-italic"></button>
                                    <button class="ql-underline"></button>
                                    <button class="ql-strike"></button>
                                    <button class="ql-link"></button>
                                    <button class="ql-script" value="sub"></button>
                                    <button class="ql-script" value="super"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-header" value="1"></button>
                                    <button class="ql-header" value="2"></button>
                                    <button class="ql-blockquote"></button>
                                    <button class="ql-code-block"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-list" value="ordered"></button>
                                    <button class="ql-list" value="bullet"></button>
                                    <button class="ql-indent" value="-1"></button>
                                    <button class="ql-indent" value="+1"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-clean"></button>
                                </span>
                            </div>
                            <div class="quill" id="${f.id}-description">${f.description}</div>
                        </div>
                    </div>
                </div>
                <div class="cards-container banner">
                    <h5>Cards<span style="color:#ccc;font-style:italic"> - click <i style="padding: 0 0.2em" class="fas fa-arrow-alt-circle-right"></i> to remove from the folder</span></h5>
                </div>
                `,
                buttons: [ {
                    text: 'Save', 
                    close: true,
                    action: () => {
                        f.name = $('.dashboard__modify-folder-name input').attr('value');
                        f.description = $('.dashboard__modify-folder-description-with-cards .quill-wrapper .quill .ql-editor').html();
                        $('#' + f.id + ' .dashboard__text').text(limitText(f.name));
                        if (startSaving) setFlagForChanges();
                        for (let c of f.cards) {
                            setSneakPeekNodeName(c.id);
                        }
                    }
                }],
                closeButton: true
            }, n => {
                initializeTextboxes();
                let notifBody = n.$.find('.cards-container');
                let cardsList = notifBody.find('.dashboard__modify-folder__cards ul');
                if (!cardsList.length) {
                    notifBody.append('<div class="dashboard__modify-folder__cards"><ul></ul></div>');
                    cardsList = notifBody.find('.dashboard__modify-folder__cards ul');
                }
                for (let c of f.cards) {
                    let cardId = 'dashboard__modify-folder__card-' + Math.floor(Math.random() * 99999);
                    cardsList.append(`<div class="dashboard__modify-folder__card" id="${cardId}"><li>${c.name}</li><i class="fas fa-arrow-alt-circle-right"></i></div>`);
                    registerCardClickEvent(c.id, `${cardId} li`, `#${cardId} li`);
                    $(`#${cardId} .fa-arrow-alt-circle-right`).click(function() {
                        let cardItem = $(this).parent();
                        cardItem.css({
                            transform: 'translateX(100%)',
                            opacity: 0
                        });
                        f.removeCard(c.id);
                        let axis = Math.ceil(Math.random() * 100);
                        let flipped = Math.ceil(Math.random() * 100);
                        let x = $('#' + folderId).offset().left + (axis >= 50 ? Math.floor(Math.random() * 241): 0) - 70 + (axis < 50 && flipped >= 50 ? 240 : 0);
                        let y = $('#' + folderId).offset().top + (axis < 50 ? Math.floor(Math.random() * 241): 0) - 70 + (axis >= 50 && flipped < 50 ? 240 : 0);
                        addFullViewNode('/files/svg/document.svg', 'dashboard__card', c.name, c.id, x, y);
                        $(`#${c.id}`).find('.dashboard__card').css('background-color', c.color);
                        setSneakPeekNodeName(c.id);
                        registerCardClickEvent(c.id);
                        let cardParent = cardItem.parent();
                        cardItem.nextAll().css({
                            transform: 'translateY(-100%)'
                        });
                        setTimeout(() => {
                            let oldTransition = cardParent.children('.dashboard__modify-folder__card').css('transition');
                            cardParent.children('.dashboard__modify-folder__card').css({
                                transition: 'unset'
                            });
                            cardItem.remove();
                            cardParent.children('.dashboard__modify-folder__card').css({
                                transform: 'unset'
                            });
                            setTimeout(() => {
                                cardParent.children('.dashboard__modify-folder__card').css({
                                    transition: oldTransition
                                });
                            }, 50);
                        }, 210);
                    });
                }
            });
        } else {
            notify.me({
                header: `Modify "${f.name}"`,
                subheader: 'Enter a new name and description',
                class: 'notify-popup dashboard__modify-popup',
                body: `
                <div class="dashboard__modify-popup__path-wrapper">
                    <div class="dashboard__modify-popup__path">
                        <div class="folder">${limitText80(f.name)}</div>
                    </div>
                </div>
                <div class="dashboard__modify-folder-container">
                    <div class="dashboard__modify-folder-name banner">
                        <div class="textbox">
                            <input type="text" name="name" autocomplete="off" required value="${f.name}">
                            <label for="name">
                                <span>Name</span>
                            </label>
                        </div>
                    </div>
                    <div class="dashboard__modify-folder-description banner">
                        <div class="quill-wrapper" id="${f.id}-description-wrapper">
                            <div class="toolbar"id="${f.id}-toolbar">
                                <span class="ql-formats">
                                    <button class="ql-bold"></button>
                                    <button class="ql-italic"></button>
                                    <button class="ql-underline"></button>
                                    <button class="ql-strike"></button>
                                    <button class="ql-link"></button>
                                    <button class="ql-script" value="sub"></button>
                                    <button class="ql-script" value="super"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-header" value="1"></button>
                                    <button class="ql-header" value="2"></button>
                                    <button class="ql-blockquote"></button>
                                    <button class="ql-code-block"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-list" value="ordered"></button>
                                    <button class="ql-list" value="bullet"></button>
                                    <button class="ql-indent" value="-1"></button>
                                    <button class="ql-indent" value="+1"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-clean"></button>
                                </span>
                            </div>
                            <div class="quill" id="${f.id}-description">${f.description}</div>
                        </div>
                    </div>
                </div>`,
                buttons: [ {
                    text: 'Save', 
                    close: true,
                    action: () => {
                        f.name = $('.dashboard__modify-folder-name input').attr('value');
                        f.description = $('.dashboard__modify-folder-description .quill-wrapper .quill .ql-editor').html();
                        $('#' + f.id + ' .dashboard__text').text(limitText(f.name));
                        if (startSaving) setFlagForChanges();
                    }
                }],
                closeButton: true
            }, () => {
                initializeTextboxes();
            });
        }
    });
}

function registerCardClickEvent(cardId, cardSelector, customTextSelector) {
    $('#' + (cardSelector || cardId)).click(function() {
        let dragging = $(this).attr('dragging');
        if (dragging && dragging === 'true')
        {
            $(this).attr('dragging', 'false');
            return;   
        }
        // Start building the "modify card" pop-up.
        const c = card.find(cardId);
        notify.me({
            header: `Modify "${c.name}"`,
            subheader: 'Enter a new name and description',
            class: 'notify-popup dashboard__modify-popup',
            body: `
            <div class="dashboard__modify-popup__path-wrapper">
                <div class="dashboard__modify-popup__path">
                    ${c.currentFolderId ? '<div class="folder">' + limitText80(folder.find(c.currentFolderId).name) + '</div>' : ''}<div class="card">${limitText80(c.name)}</div>
                </div>
            </div>
            <div class="dashboard__modify-card-container">
                <div class="dashboard__modify-card-name banner">
                    <div class="textbox">
                        <input type="text" name="name" autocomplete="off" required value="${c.name}">
                        <label for="name">
                            <span>Name</span>
                        </label>
                    </div>
                </div>
                <div class="dashboard__modify-card-description banner">
                    <div class="quill-wrapper" id="${c.id}-description-wrapper">
                        <div class="toolbar" id="${c.id}-toolbar">
                            <span class="ql-formats">
                                <button class="ql-bold"></button>
                                <button class="ql-italic"></button>
                                <button class="ql-underline"></button>
                                <button class="ql-strike"></button>
                                <button class="ql-link"></button>
                                <button class="ql-script" value="sub"></button>
                                <button class="ql-script" value="super"></button>
                            </span>
                            <span class="ql-formats">
                                <button class="ql-header" value="1"></button>
                                <button class="ql-header" value="2"></button>
                                <button class="ql-blockquote"></button>
                                <button class="ql-code-block"></button>
                            </span>
                            <span class="ql-formats">
                                <button class="ql-list" value="ordered"></button>
                                <button class="ql-list" value="bullet"></button>
                                <button class="ql-indent" value="-1"></button>
                                <button class="ql-indent" value="+1"></button>
                            </span>
                            <span class="ql-formats">
                                <button class="ql-clean"></button>
                            </span>
                        </div>
                        <div class="quill" id="${c.id}-description">${c.description}</div>
                    </div>
                </div>
                <div class="dashboard__modify-card-options-wrapper banner">
                    <div class="dashboard__modify-card-priority-number dashboard__modify-card-option">
                        <h3>Priority</h3>
                        <div class="dashboard__modify-card-priority-number-input-wrapper">
                            <div class="textbox">
                                <input type="number" id="dashboard__modify-card-priority-number-input" autocomplete="off" value="${c.priorityNumber}">
                                <label for="dashboard__modify-card-priority-number">
                                    <span>Priority</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="dashboard__modify-card-flag dashboard__modify-card-option">
                        <h3>Flags</h3>
                        <div class="dashboard__modify-card-flag-input-wrapper">
                            <button id="dashboard__modify-card-flag-star" class="medium"><i class="fas fa-star"></i></button>
                            <button id="dashboard__modify-card-flag-flag" class="medium"><i class="fas fa-flag"></i></button>
                            <button id="dashboard__modify-card-flag-exclamation" class="medium"><i class="fas fa-exclamation-triangle"></i> </button>
                            <button id="dashboard__modify-card-flag-question" class="medium"><i class="fas fa-question-circle"></i></button>
                            <button id="dashboard__modify-card-flag-info" class="medium"><i class="fas fa-info-circle"></i></button>
                        </div>
                    </div>
                    <div class="dashboard__modify-card-color dashboard__modify-card-option">
                        <h3>Color</h3>
                        <input type="text" id="dashboard__modify-card-color-input" />
                    </div>
                </div>
            </div>
            `,
            buttons: [ {
                text: 'Due Date',
                close: false,
                action: () => {
                    let currentDate = new Date();
                    let tomorrowsDate = new Date(currentDate);
                    tomorrowsDate.setDate(currentDate.getDate() + 1);
                    notify.me({
                        header: 'Due Date',
                        subheader: 'Enter a new due date and time',
                        class: 'notify-popup dashboard__due-date-popup',
                        body: `
                        <div class="dashboard__modify-popup__path-wrapper">
                            <div class="dashboard__modify-popup__path">
                            ${c.currentFolderId ? '<div class="folder">' + limitText80(folder.find(c.currentFolderId).name) + '</div>' : ''}<div class="card">${limitText80(c.name)}</div>
                            </div>
                        </div>
                        <div class="dashboard__due-date-container">
                            <div class="dashboard__due-date-time">
                                <div class="textbox">
                                        <input type="time" name="time" autocomplete="off" required value="${c.time ? c.time : "10:00"}">
                                        <label for="time">
                                            <span>Time</span>
                                        </label>
                                    </div>
                                </div>
                            <div class="dashboard__due-date-date">
                                <div class="textbox">
                                    <input type="date" name="date" autocomplete="off" required value="${c.date ? c.date : `${tomorrowsDate.getFullYear()}-${tomorrowsDate.getMonth() + 1 < 10 ? '0' + (tomorrowsDate.getMonth() + 1) : tomorrowsDate.getMonth() + 1}-${tomorrowsDate.getDate() < 10 ? '0' + tomorrowsDate.getDate() : tomorrowsDate.getDate()}`}">
                                    <label for="date">
                                        <span>Date</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        `,
                        buttons: [ {
                            text: 'Done', 
                            close: true,
                            action: () => {
                                c.date = $('.dashboard__due-date-date input').attr('value'); // Get the value of $('.dashboard__create-due-date-date input')
                                c.time = $('.dashboard__due-date-time input').attr('value'); // Get the value of $('.dashboard__create-due-date-time input')
                                if (startSaving) setFlagForChanges();
                                addSneakPeekNode(c.id);
                            }
                        }],
                        closeButton: false
                    }, () => {
                        initializeTextboxes();
                    });
                }
            }, {
                text: 'Save',
                close: true,
                action: () => {
                    c.name = $('.dashboard__modify-card-name input').attr('value');
                    c.description = $('.dashboard__modify-card-description .quill-wrapper .quill .ql-editor').html();
                    c.color = $('#dashboard__modify-card-color-input').spectrum('get').toHexString();
                    $(`#${c.id}`).find('.dashboard__card').css('background-color', c.color);
                    let priorityFlags = [];
                    for (let flagBtn of $('.dashboard__modify-card-flag-input-wrapper').children('.selected'))
                        priorityFlags.push($(flagBtn).attr('id').replace('dashboard__modify-card-flag-', ''));
                    c.priorityFlags = priorityFlags;
                    c.priorityNumber = $('#dashboard__modify-card-priority-number-input').val();
                    if (customTextSelector)
                        $(customTextSelector).text(c.name);
                    addSneakPeekNode(c.id);
                    $('#' + c.id + ' .dashboard__text').text(limitText(c.name));
                    $('#dashboard__sneak-peek__node__' + c.id + ' .name .inner').text(limitText80(c.name));
                    if (startSaving) setFlagForChanges();
                }
            }],
            closeButton: true
        }, () => {  
            for (let flag of c.priorityFlags)
                $('.dashboard__modify-card-flag-input-wrapper').find(`#dashboard__modify-card-flag-${flag}`).addClass('selected');
            $('#dashboard__modify-card-color-input').spectrum({
                color: c.color || '#ddd0f1', 
                showInput: true,
                showInitial: true
            });
            $('#dashboard__modify-card-flag-star, #dashboard__modify-card-flag-flag, #dashboard__modify-card-flag-exclamation, #dashboard__modify-card-flag-question, #dashboard__modify-card-flag-info')
                .click(function() {
                    $(this).toggleClass('selected');
                });
            initializeTextboxes();
        });
    });
}

const card = Object.freeze(new function() {
    let obj = {}, cards = [];

    obj.cards = cards;

    obj.create = cardId => {
        let c = {
            id: cardId,
            name: 'New Card'
        };
        cards.push(c);
        if (startSaving) setFlagForChanges();
        return c;
    };

    obj.delete = cardId => {
        let c = cards.findIndex(_ => _.id === cardId);
        if (c >= 0) {
            $(`#dashboard__sneak-peek__node__${cardId}`).remove();
            if (!$('#dashboard__sneak-peek').children().not('#dashboard__sneak-peek__nothing-due').length)
                $('#dashboard__sneak-peek').addClass('nothing-due');
            cards.splice(c, 1);
            if (startSaving) setFlagForChanges();
        }
    };

    obj.find = id => cards.find(_ => _.id === id);

    return obj;
});

const folder = Object.freeze(new function() {
    let obj = {}, folders = [];

    obj.folders = folders;

    obj.create = folderId => {
        let f = {
            id: folderId,
            name: 'New Folder',
            cards: [],
            addCard: cardId => {
                const $folder = $('#' + f.id);
                const counter = $folder.find('.dashboard__counter');
                if (counter.length) {
                    let currentCount = parseInt(counter.text());
                    counter.text(++currentCount);
                    counter.addClass('show');
                }
                let c = card.find(cardId);
                c.currentFolderId = f.id;
                f.cards.push(c);
                let contextOptions = contextly.find($folder).options;
                if (contextOptions.length < 3) {
                    contextOptions.push({
                        id: c.id,
                        text:
                        `
                            <div class="banner" cardId="${c.id}">
                                ${c.name}
                            </div>
                        `,
                        tooltip: 'Modify Card',
                        action: () => { },
                        onShow: $e => {
                            $(`#${$e.attr('id')} .banner`).text(c.name);
                            registerCardClickEvent($e.find('.banner').attr('cardId'), $e.attr('id'));
                        }
                    });
                } else if (contextOptions.length === 3) {
                    contextOptions.push({
                        text: 'View More',
                        tooltip: 'View More',
                        action: () => {
                            $('#' + f.id).click();
                        }
                    });
                }
                contextly.modify('#' + f.id, contextOptions, {
                    heightFactor: 8,
                    maxWidth: 300
                });
                if (startSaving) setFlagForChanges();
            },
            removeCard: cardId => {
                const $folder = $('#' + f.id);
                const counter = $folder.find('.dashboard__counter');
                if (counter.length) {
                    let currentCount = parseInt(counter.text()) - 1;
                    counter.text(currentCount);
                    if (currentCount === 0)
                        counter.removeClass('show');
                }
                let c = card.find(cardId);
                f.cards.splice(f.cards.findIndex(_ => _.id === cardId), 1);
                c.currentFolderId = null;
                let contextOptions = contextly.find($folder).options;
                contextOptions.splice(0, contextOptions.length);
                for (let card of f.cards) {
                    if (contextOptions.length < 3) {
                        contextOptions.push({
                            id: card.id,
                            text:
                            `
                                <div class="banner" cardId="${card.id}">
                                    ${card.name}
                                </div>
                            `,
                            tooltip: 'Modify Card',
                            action: () => { },
                            onShow: $e => {
                                $(`#${$e.attr('id')} .banner`).text(card.name);
                                registerCardClickEvent($e.find('.banner').attr('cardId'), $e.attr('id'));
                            }
                        });
                    } else break;
                }
                if (f.cards.length > 3) {
                    contextOptions.push({
                        text: 'View More',
                        tooltip: 'View More',
                        action: () => {
                            $('#' + f.id).click();
                        }
                    });
                }
                contextly.modify('#' + f.id, contextOptions, {
                    heightFactor: 8,
                    maxWidth: 300
                });
                if (startSaving) setFlagForChanges();
            },
            findCard: id => f.cards.find(_ => _.id === id)
        };
        folders.push(f);
        if (startSaving) setFlagForChanges();
        return f;
    };

    obj.delete = folderId => {
        let fIndex = folders.findIndex(_ => _.id === folderId);
        if (fIndex >= 0) {
            let f = folders[fIndex];
            for (let innerCard of f.cards) {
                $(`#dashboard__sneak-peek__node__${innerCard.id}`).remove();
                if (!$('#dashboard__sneak-peek').children().not('#dashboard__sneak-peek__nothing-due').length)
                    $('#dashboard__sneak-peek').addClass('nothing-due');
                card.delete(innerCard.id);
            }
            f.cards.splice(0, f.cards.length);
            folders.splice(fIndex, 1);
            if (startSaving) setFlagForChanges();
        }
    };

    obj.find = id => folders.find(_ => _.id === id);

    return obj;
});

function returnNodesToView(viewWidth) {
    if (viewWidth >= 800) {
        $('.dashboard__draggable').each(function() {
            if ($(this).find('.dashboard__pin').hasClass('active')) return;
            let parent = $('#dashboard__full-view');
            let _ = $(this);
            let top = parseFloat(_.css('top').replace('px', ''));
            let left = parseFloat(_.css('left').replace('px', ''));
            let y = _.attr('data-y') || 0;
            y = parseFloat(y);
            let x = _.attr('data-x') || 0;
            x = parseFloat(x);
            let relativeY = top + y;
            let relativeX = left + x;
            let width = _.width();
            let height = _.height();
            _.css('transition', 'transform 200ms cubic-bezier(.4,.0,.23,1)');
            if (relativeY + height > parent.innerHeight() && relativeX + width > parent.innerWidth()) {
                let newX = parent.innerWidth() - width - left;
                let newY = parent.innerHeight() - height - top;
                _.attr('data-x', newX);
                _.attr('data-y', newY);
                _.css('transform', `translate(${newX}px, ${newY}px)`);
                if (startSaving) setFlagForChanges();
            } else if (relativeY + height > parent.innerHeight()) {
                let newY = parent.innerHeight() - height - top;
                _.attr('data-y', newY);
                _.css('transform', `translate(${x}px, ${newY}px)`);
                if (startSaving) setFlagForChanges();
            } else if (relativeX + width > parent.innerWidth()) {
                let newX = parent.innerWidth() - width - left;
                _.attr('data-x', newX);
                _.css('transform', `translate(${newX}px, ${y}px)`);
                if (startSaving) setFlagForChanges();
            } else if (relativeY < 0 && relativeX < 0) {
                let newX = -1 * left;
                let newY = -1 * top;
                _.attr('data-x', newX);
                _.attr('data-y', newY);
                _.css('transform', `translate(${newX}px, ${newY}px)`);
                if (startSaving) setFlagForChanges();
            } else if (relativeY < 0) {
                let newY = -1 * top;
                _.attr('data-y', newY);
                _.css('transform', `translate(${x}px, ${newY}px)`);
                if (startSaving) setFlagForChanges();
            } else if (relativeX < 0) {
                let newX = -1 * left;
                _.attr('data-x', newX);
                _.css('transform', `translate(${newX}px, ${y}px)`);
                if (startSaving) setFlagForChanges();
            }
            setTimeout(() => _.css('transition', 'unset'), 210);
        });
    }
}

$(function() {
    if (user.backgroundTile) {
        const backgroundImage = $('#dashboard__full-view .background img');
        backgroundImage.attr('src', '');
        backgroundImage.css('background', `url("${user.backgroundTile}") repeat`);
    }
    savedIcon = $('#dashboard__saved');
    savedIcon.hide();
    savedAnim = lottie.loadAnimation({
        container: savedIcon.get(0),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/lottie/done.json'
    });
    savedAnim.setDirection(1);
    savedAnim.setSpeed(1);
    const fullscreenBtn = $('#dashboard__fullscreen');
    const fullscreenAnim = lottie.loadAnimation({
        container: fullscreenBtn.get(0),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/lottie/fullscreen.json',
        initialSegment: [0, 14]
    });
    fullscreenBtn.hover(function() {
        fullscreenAnim.setDirection(1);
        fullscreenAnim.setSpeed(3);
        fullscreenAnim.play();
    }, function() {
        fullscreenAnim.setDirection(-1);
        fullscreenAnim.setSpeed(3);
        fullscreenAnim.play();
    });
    fullscreenBtn.click(function() {
        setFullscreenElement($('#dashboard__full-view'));
    });
    const returnNodesBtn = $('#dashboard__return-nodes');
    const returnNodesAnim = lottie.loadAnimation({
        container: returnNodesBtn.get(0),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/lottie/design.json',
        initialSegment: [0, 14]
    });
    returnNodesBtn.hover(function() {
        returnNodesAnim.setDirection(1);
        returnNodesAnim.setSpeed(1.2);
        returnNodesAnim.play();
    }, function() {
        returnNodesAnim.setDirection(-1);
        returnNodesAnim.setSpeed(1.2);
        returnNodesAnim.play();
    });
    returnNodesBtn.click(function() {
        returnNodesToView($(window).width());
    });
    contextly.init('#dashboard__full-view', '#dashboard__full-view', [{
        icon: 'document',
        text: 'Create a card',
        tooltip: 'Create Card',
        action: e => {
            const id = 'dashboard__card-' + Math.floor(Math.random() * 99999);
            let date, time;
            notify.me({
                header: `Create a Card`,
                subheader: 'Enter a name and description',
                class: 'notify-popup dashboard__create-card-popup',
                body: `
                <div class="dashboard__create-card-container">
                    <div class="dashboard__create-card-name banner">
                        <div class="textbox">
                            <input type="text" name="name" autocomplete="off" required value="New Card">
                            <label for="name">
                                <span>Name</span>
                            </label>
                        </div>
                    </div>
                    <div class="dashboard__create-card-description banner">
                        <div class="quill-wrapper" id="${id}-description-wrapper">
                            <div class="toolbar"id="${id}-toolbar">
                                <span class="ql-formats">
                                    <button class="ql-bold"></button>
                                    <button class="ql-italic"></button>
                                    <button class="ql-underline"></button>
                                    <button class="ql-strike"></button>
                                    <button class="ql-link"></button>
                                    <button class="ql-script" value="sub"></button>
                                    <button class="ql-script" value="super"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-header" value="1"></button>
                                    <button class="ql-header" value="2"></button>
                                    <button class="ql-blockquote"></button>
                                    <button class="ql-code-block"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-list" value="ordered"></button>
                                    <button class="ql-list" value="bullet"></button>
                                    <button class="ql-indent" value="-1"></button>
                                    <button class="ql-indent" value="+1"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-clean"></button>
                                </span>
                            </div>
                            <div class="quill" id="${id}-description"></div>
                        </div>
                    </div>
                    <div class="dashboard__create-card-options-wrapper banner">
                        <div class="dashboard__create-card-priority-number dashboard__create-card-option">
                            <h3>Priority</h3>
                            <div class="dashboard__create-card-priority-number-input-wrapper">
                                <div class="textbox">
                                    <input type="number" id="dashboard__create-card-priority-number-input" autocomplete="off">
                                    <label for="dashboard__create-card-priority-number">
                                        <span>Priority</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="dashboard__create-card-flag dashboard__create-card-option">
                            <h3>Flags</h3>
                            <div class="dashboard__create-card-flag-input-wrapper">
                                <button id="dashboard__create-card-flag-star" class="medium"><i class="fas fa-star"></i></button>
                                <button id="dashboard__create-card-flag-flag" class="medium"><i class="fas fa-flag"></i></button>
                                <button id="dashboard__create-card-flag-exclamation" class="medium"><i class="fas fa-exclamation-triangle"></i></button>
                                <button id="dashboard__create-card-flag-question" class="medium"><i class="fas fa-question-circle"></i></button>
                                <button id="dashboard__create-card-flag-info" class="medium"><i class="fas fa-info-circle"></i></button>
                            </div>
                        </div>
                        <div class="dashboard__create-card-color dashboard__create-card-option">
                            <h3>Color</h3>
                            <input type="text" id="dashboard__create-card-color-input" />
                        </div>
                    </div>
                </div>
                `,
                buttons: [ {
                    text: 'Due Date',
                    close: false,
                    action: () => {
                        let currentDate = new Date();
                        let tomorrowsDate = new Date(currentDate);
                        tomorrowsDate.setDate(currentDate.getDate() + 1);
                        notify.me({
                            header: 'Due Date',
                            subheader: 'Enter a due date and time',
                            class: 'notify-popup dashboard__due-date-popup',
                            body: `
                            <div class="dashboard__due-date-container">
                                <div class="dashboard__due-date-time">
                                    <div class="textbox">
                                            <input type="time" name="time" autocomplete="off" required value="10:00">
                                            <label for="time">
                                                <span>Time</span>
                                            </label>
                                        </div>
                                    </div>
                                <div class="dashboard__due-date-date">
                                    <div class="textbox">
                                        <input type="date" name="date" autocomplete="off" required value="${tomorrowsDate.getFullYear()}-${tomorrowsDate.getMonth() + 1 < 10 ? '0' + (tomorrowsDate.getMonth() + 1) : tomorrowsDate.getMonth() + 1}-${tomorrowsDate.getDate() < 10 ? '0' + tomorrowsDate.getDate() : tomorrowsDate.getDate()}">
                                        <label for="date">
                                            <span>Date</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            `,
                            buttons: [ {
                                text: 'Done',
                                close: true,
                                action: () => {
                                    if ($('.dashboard__due-date-date input').attr('value')) {
                                        date = $('.dashboard__due-date-date input').attr('value');
                                        if ($('.dashboard__due-date-time input').attr('value')) {
                                            time = $('.dashboard__due-date-time input').attr('value');
                                        }
                                    }
                                }
                            }],
                            closeButton: false
                        }, () => {
                            initializeTextboxes();
                        });
                    }
                }, {
                    text: 'Create',
                    close: true,
                    action: () => {
                        let c = card.create(id);
                        c.name = $('.dashboard__create-card-name input').attr('value');
                        c.description = $('.dashboard__create-card-description .quill-wrapper .quill .ql-editor').html();
                        c.date = date;
                        c.time = time;
                        c.color = $('#dashboard__create-card-color-input').spectrum('get').toHexString();
                        let priorityFlags = [];
                        for (let flagBtn of $('.dashboard__create-card-flag-input-wrapper').children('.selected'))
                            priorityFlags.push($(flagBtn).attr('id').replace('dashboard__create-card-flag-', ''));
                        c.priorityFlags = priorityFlags;
                        c.priorityNumber = $('#dashboard__create-card-priority-number-input').val();
                        addSneakPeekNode(id);
                        addFullViewNode('/files/svg/document.svg', 'dashboard__card', c.name, id, e.x, e.y);
                        $(`#${c.id}`).find('.dashboard__card').css('background-color', c.color);
                        registerCardClickEvent(c.id);
                    }
                }],
                closeButton: false
            }, () => {
                $('#dashboard__create-card-color-input').spectrum({
                    color: '#ddd0f1', 
                    showInput: true,
                    showInitial: true
                });
                $('#dashboard__create-card-flag-star, #dashboard__create-card-flag-flag, #dashboard__create-card-flag-exclamation, #dashboard__create-card-flag-question, #dashboard__create-card-flag-info')
                    .click(function() {
                        $(this).toggleClass('selected');
                    });
                initializeTextboxes();
            });
        }
    }, {
        icon: 'add-folder',
        text: 'Create a folder',
        tooltip: 'Create Folder',
        action: e => {
            let folderId = 'dashboard__folder-' + Math.floor(Math.random() * 99999);
            notify.me({
                header: 'Create a Folder',
                subheader: 'Enter a name and description.',
                class: 'notify-popup dashboard__create-folder-popup',
                body: `
                <div class="dashboard__create-folder-container">
                    <div class="dashboard__create-folder-name banner">
                        <div class="textbox">
                            <input type="text" name="name" autocomplete="off" required value="New Folder">
                            <label for="name">
                                <span>Name</span>
                            </label>
                        </div>
                    </div>
                    <div class="dashboard__create-folder-description banner">
                        <div class="quill-wrapper" id="${folderId}-description-wrapper">
                            <div class="toolbar" id="${folderId}-toolbar">
                                <span class="ql-formats">
                                    <button class="ql-bold"></button>
                                    <button class="ql-italic"></button>
                                    <button class="ql-underline"></button>
                                    <button class="ql-strike"></button>
                                    <button class="ql-link"></button>
                                    <button class="ql-script" value="sub"></button>
                                    <button class="ql-script" value="super"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-header" value="1"></button>
                                    <button class="ql-header" value="2"></button>
                                    <button class="ql-blockquote"></button>
                                    <button class="ql-code-block"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-list" value="ordered"></button>
                                    <button class="ql-list" value="bullet"></button>
                                    <button class="ql-indent" value="-1"></button>
                                    <button class="ql-indent" value="+1"></button>
                                </span>
                                <span class="ql-formats">
                                    <button class="ql-clean"></button>
                                </span>
                            </div>
                            <div class="quill" id="${folderId}-description"></div>
                        </div>
                    </div>
                </div>
                `,
                buttons: [{
                    text: 'Create', 
                    close: true,
                    action: () => {
                        let f = folder.create(folderId);
                        f.name = $('.dashboard__create-folder-name input').attr('value');
                        f.description = $('.dashboard__create-folder-description .quill-wrapper .quill .ql-editor').html();
                        addFullViewNode('/files/svg/folder.svg', 'dashboard__folder', f.name, folderId, e.x, e.y);
                        contextly.init('#' + folderId, '#dashboard__full-view', []);
                        registerFolderClickEvent(folderId);
                    }
                }],
                closeButton: false
            }, () => {
                initializeTextboxes();
            });
        }
    }], {
        minHeight: 100,
        showOnLeftClick: false
    });
    $(window).afterResize(function(e) {
        returnNodesToView(e.size.width);
    });
    if (user.nightMode && !user.backgroundTile)
        $('#dashboard__full-view .background img').attr('src', '/files/svg/grid-black.svg');
    finishLoading('dashboard');
});

interact('.dashboard__folder-wrapper').dropzone({
    accept: '.dashboard__card-wrapper',
    overlap: 0.25,
  
    ondropactivate: function (event) {
    },
    ondragenter: function (event) {
        // On card dragged in (to the folder).
        const card = event.relatedTarget;
        const folder = event.target;

        // feedback the possibility of a drop
        folder.classList.add('selected-dropzone');
        card.classList.add('can-drop');
    },
    ondragleave: function (event) {
        // On card dragged away (from the folder).
        const card = event.relatedTarget;
        const folder = event.target;

        folder.classList.remove('selected-dropzone');
        card.classList.remove('can-drop');
    },
    ondrop: function (event) {
        // On card dropped (into folder).
        const card = event.relatedTarget;
        const _folder = event.target;
        const cardId = event.relatedTarget.id;
        const folderId = event.target.id;

        _folder.classList.remove('selected-dropzone');
        folder.find(folderId).addCard(cardId);
        setSneakPeekNodeName(cardId);
        $(card).fadeOut(200, function() {
            card.classList.remove('can-drop');
            $(this).remove();
        });
    },
    ondropdeactivate: function (event) {
    }
});

interact('.draggable').draggable({
    inertia: true,
    modifiers: [
        interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
        })
    ],
    autoScroll: true,
    listeners: {
        move: dragMoveListener,
        end (event) {
            var target = event.target;
            setTimeout(() => {
                target.setAttribute('dragging', 'false');
                dragging = false;
            }, 50);
        }
    }
});

function dragMoveListener (event) {
    var target = event.target;
    if ($(target).find('.dashboard__pin').hasClass('active'))
        return;

    target.setAttribute('dragging', 'true');
    dragging = true;

    // keep the dragged position in the data-x/data-y attributes
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px, ' + y + 'px) ';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    
    if (!dashboardHasChanges && startSaving)
        setFlagForChanges();
}

// this function is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;

network.on('dashboardLoadComplete', dashboard => {
    let setPos = ($e, pos) => {
        if ($e.length && pos) {
            $e.css({
                left: pos.left,
                top: pos.top,
                transform: `translate(${pos.x}px, ${pos.y}px)` 
            });
            $e.attr('data-x', pos.x);
            $e.attr('data-y', pos.y);
        }
    };
    for (let i = 0; i < dashboard.cards.length; i++) {
        let c = dashboard.cards[i];
        let cRef = card.create(c.id);
        cRef.name = c.name;
        cRef.description = c.description;
        cRef.date = c.date;
        cRef.time = c.time;
        cRef.pinned = c.pinned;
        cRef.color = c.color;
        cRef.priorityFlags = c.priorityFlags || [];
        cRef.priorityNumber = c.priorityNumber;
        cRef.currentFolderId = c.currentFolderId;
        if (!c.currentFolderId) {
            addFullViewNode('/files/svg/document.svg', 'dashboard__card', c.name, c.id, c.left, c.top);
            $(`#${c.id}`).find('.dashboard__card').css('background-color', c.color);
            setPos($(`#${c.id}`), c.pos);
            registerCardClickEvent(cRef.id);
            addSneakPeekNode(c.id);
        }
        if (cRef.pinned)
            $(`#${cRef.id}`).find('.dashboard__card .dashboard__pin').addClass('active');
    }
    for (let i = 0; i < dashboard.folders.length; i++) {
        let f = dashboard.folders[i];
        addFullViewNode('/files/svg/folder.svg', 'dashboard__folder', f.name, f.id, f.left, f.top);
        setPos($(`#${f.id}`), f.pos);
        let fRef = folder.create(f.id);
        fRef.name = f.name;
        fRef.description = f.description;
        fRef.pinned = f.pinned;
        if (fRef.pinned)
            $(`#${f.id}`).find('.dashboard__folder .dashboard__pin').addClass('active');
            contextly.init('#' + fRef.id, '#dashboard__full-view', []);
        registerFolderClickEvent(fRef.id);
        if (f.cards.length) {
            let $folder = $(`#${f.id}`);
            for (let c of f.cards) {
                fRef.addCard(c.id);
                addSneakPeekNode(c.id);
            }
        }
    }
    startSaving = true;
}).on('dashboardLoadFailed', json => {
    notify.me({
        header: 'Uh oh',
        subheader: 'Something went wrong',
        body: 'Looks like we weren\'t able to load your dashboard.<br>Please try refreshing.',
        buttons:[{
            text: 'Ok',
            class: 'medium',
            close: true
        }]
    })
}).on('dashboardSaveRequest', () => {
    let dashboard = {
        folders: folder.folders || [],
        cards: card.cards || []
    };
    let getPos = $e => {
        if ($e.length) {
            return {
                left: $e.css('left'),
                top: $e.css('top'),
                x: $e.attr('data-x'),
                y: $e.attr('data-y')
            };
        }
        return null;
    };
    for (let i = 0; i < dashboard.folders.length; i++) {
        let f = dashboard.folders[i];
        let $f = $(`#${f.id}`);
        f.pos = getPos($f);
    }
    for (let i = 0; i < dashboard.cards.length; i++) {
        let c = dashboard.cards[i];
        let $c = $(`#${c.id}`);
        c.pos = getPos($c);
    }
    if (dashboardHasChanges && !dashboardTryingToSave) {
        dashboardTryingToSave = true;
        network.send('dashboardSave', dashboard);
    }
}).on('dashboardSaveComplete', () => {
    dashboardHasChanges = false;
    dashboardTryingToSave = false;
    if (!dragging) {
        savedIcon.fadeIn(200);
        savedAnim.goToAndPlay(0, true);
        if (savedFadeOut)
            clearTimeout(savedFadeOut);
        savedFadeOut = setTimeout(() => {
            savedIcon.fadeOut(200);
        }, 3000);
    }
}).on('dashboardSaveFailed', () => {
}).send('dashboardLoad');