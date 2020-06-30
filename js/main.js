(function (g, w) {
    "use strict";

    var doc = w.document, floor = w.Math.floor;

    var lib = {
        setCookie: function setCookie(name, value, opts) {
            opts        = opts || {};
            var options = {}, k;
            for (k in opts) {
                if (w.Object.prototype.hasOwnProperty.call(opts, k)) {
                    options[k] = opts[k];
                }
            }

            if (!options.path) {
                options.path = '/';
            }

            if (options.expires instanceof w.Date) {
                options.expires = options.expires.toUTCString();
            }

            var
                updatedCookie = w.encodeURIComponent(name) + "=" + w.encodeURIComponent(value),
                optionKey, optionValue;
            for (optionKey in options) {
                updatedCookie += "; " + optionKey;
                optionValue = options[optionKey];
                if (optionValue !== true) {
                    updatedCookie += "=" + optionValue;
                }
            }
            doc.cookie = updatedCookie;
        },
        // возвращает куки с указанным name,
        // или undefined, если ничего не найдено
        getCookie: function getCookie(name) {
            var matches = doc.cookie.match(new w.RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? w.decodeURIComponent(matches[1]) : undefined;
        },
        genId: function () {
            return 'cntdwn' + new w.Date().getTime();
        },
        millisecToTimeStruct: function (ms) {
            return {
                days: floor(ms / (1000 * 60 * 60 * 24)),
                hours: floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: floor((ms % (1000 * 60)) / 1000)
            };
        },
        formatTimeStruct: function (ts) {
            return {
                days: ts.days.toString().length > 1 ? ts.days : '0' + ts.days.toString(),
                hours: ts.hours.toString().length > 1 ? ts.hours : '0' + ts.hours.toString(),
                minutes: ts.minutes.toString().length > 1 ? ts.minutes : '0' + ts.minutes.toString(),
                seconds: ts.seconds.toString().length > 1 ? ts.seconds : '0' + ts.seconds.toString(),
            }
        },
        isArray: function (entity) {
            return w.Object.prototype.toString.call(entity) === '[object Array]';
        }
    };

    function LocalStateGateway() {
        this._cookieName = 'cvwe303jijeww';

        this.retrieve = function (name) {
            return lib.getCookie(name);
        };

        this.save = function (name, value) {
            return lib.setCookie(name, value, {
                expires: new Date('2030-12-17T03:24:00')
            });
        };

        this.retrieveDate = function (name) {
            var
                timestamp = +lib.getCookie(name),
                date;

            if (timestamp) {
                date = new w.Date(timestamp);
                if (w.Object.prototype.toString.call(date) === '[object Date]') {
                    if (isNaN(date.getTime())) {
                        date = undefined;
                    }
                }
            }

            return date;
        };

        /**
         * @param  name String
         * @param  date Date
         */
        this.saveDate = function (name, date) {
            return this.save(name, date.getTime());
        };


        this.retrieveCountDownDate = function () {
            return this.retrieveDate(this._cookieName);
        };

        this.saveCountDownDate = function (date) {
            this.saveDate(this._cookieName, date);
        }

        return this;
    }

    function CountdownTimer(cfg) {
        this._$days               = cfg.$days;
        this._$hours              = cfg.$hours;
        this._$minutes            = cfg.$minutes;
        this._$seconds            = cfg.$seconds;
        this._$activeContent      = cfg.$activeContent;
        this._$finishedContent    = cfg.$finishedContent;
        this._activePeriodSeconds = cfg.activePeriodSeconds;
        this.id                   = lib.genId();
        this._localState          = new LocalStateGateway();
        this._countDownDate       = new w.Date();
        this._timeIntervalId      = 0;
        this._onTick              = this._onTick.bind(this);
        this._distance            = 0;

        this._init();

        if (this._isTimerNeedToEnable()) {
            this._run();
        } else {
            this._stop();
        }

        return this;
    }

    var countDownPrototype = CountdownTimer.prototype;

    countDownPrototype._calcNewCountDownDate = function calcNewCountDownDate() {
        return new Date(new Date().getTime() + 1000 * this._activePeriodSeconds);
    }

    /**
     * Initialises global app state
     * Recalculates state is timer enabled
     * @returns {CountdownTimer}
     * @private
     */
    countDownPrototype._init = function () {
        this._countDownDate = this._localState.retrieveCountDownDate();
        if (!this._countDownDate) {
            this._countDownDate = this._calcNewCountDownDate();
            this._localState.saveCountDownDate(this._countDownDate);
        }

        return this;
    }

    countDownPrototype._isTimerNeedToEnable = function () {
        return (this._countDownDate.getTime() - new w.Date().getTime()) > 0;
    }

    countDownPrototype._isTimerNeedToDisable = function () {
        return this._distance <= 0;
    }

    countDownPrototype._run = function () {
        w.setInterval(this._onTick, 1000);
        this._activatePromo();
    }


    countDownPrototype._stop = function () {
        clearInterval(this._timeIntervalId);
        this._desActivatePromo();
    }

    countDownPrototype._onTick = function () {
        this._recalcDistance();
        if (this._isTimerNeedToDisable()) {
            this._stop()
        } else {
            this._render();
        }
        return this;
    }

    countDownPrototype._recalcDistance = function () {
        this._distance = this._countDownDate.getTime() - (new w.Date().getTime());
        return this;
    }

    countDownPrototype._render = function () {
        var timeStruct = lib.millisecToTimeStruct(this._distance);
        timeStruct     = lib.formatTimeStruct(timeStruct);
        if (this._$days && (+timeStruct.days) > 0) {
            this._$days.innerText = timeStruct.days;
        }

        if (this._$hours) {
            this._$hours.innerText = timeStruct.hours;
        }

        if (this._$minutes) {
            this._$minutes.innerText = timeStruct.minutes;
        }

        if (this._$seconds) {
            this._$seconds.innerText = timeStruct.seconds;
        }

        return this;
    }

    countDownPrototype._activatePromo = function () {
        var i = 0;
        if (lib.isArray(this._$activeContent)) {
            for (i = 0; i < this._$activeContent.length; i++) {
                this._$activeContent[i].style.display = 'block';
            }
        }
        if (lib.isArray(this._$finishedContent)) {
            for (i = 0; i < this._$finishedContent.length; i++) {
                this._$finishedContent[i].style.display = 'none';
            }
        }
        return this;
    }

    countDownPrototype._desActivatePromo = function () {
        var i = 0;
        if (lib.isArray(this._$activeContent)) {
            for (i = 0; i < this._$activeContent.length; i++) {
                this._$activeContent[i].style.display = 'none';
            }
        }
        if (lib.isArray(this._$finishedContent)) {
            for (i = 0; i < this._$finishedContent.length; i++) {
                this._$finishedContent[i].style.display = 'block';
            }
        }
        return this;
    }


    g.run = function (cfg) {
        return new CountdownTimer(cfg);
    };

})(countdownNamespace = {}, window);
