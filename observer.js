/*
 * Copyright (c) 2016-present, IBM Research
 * Licensed under The MIT License [see LICENSE for details]
 */

"use strict"; 

function initSubject (subject)
{
    if(!subject.observers)
    {
        subject.observers = [];
    }
    if(!subject.notify)
    {
        subject.notify = (method, arg1, ...arg2) =>
        {
            notify(subject, method, arg1, ...arg2);
        };
    }
    if(!subject.addObserver)
    {
        subject.addObserver = (observer) =>
        {
            addObserver(subject, observer)
        };
    }
    if(!subject.removeObserver)
    {
        subject.removeObserver = (observer) =>
        {
            removeObserver(subject, observer);
        };
    }
}

function notify (subject, method, arg1, ...arg2)
{
    for (let i = 0; i < subject.observers.length; i++)
    {
        if (subject.observers[i][method])
        {
            try
            {
                subject.observers[i][method](arg1, ...arg2);
            }
            catch(err)
            {
                console.trace(err);
            }
        }
    }
};

function addObserver (subject, observer)
{
    if(subject.observers === undefined)
    {
        subject.observers = [];
    }

    subject.observers.push(observer);
}

function removeObserver(subject, observer)
{
    if(subject.observers !== undefined)
    {
        let idx = subject.observers.indexOf(observer);
        if(idx >= 0)
        {
            subject.observers.splice(idx, 1);
        }
    }
}

exports.initSubject = initSubject;
exports.notify = notify;
exports.addObserver = addObserver;
exports.removeObserver = removeObserver;