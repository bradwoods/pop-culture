// @ts-ignore
(function () {
    const parentElem = document.querySelector("#matrix");

    if (!parentElem) {
        return;
    }

    const COL_COUNT = 14;

    const speedMS = {
        max: 34,
        min: 200,
    };
    const delayMS = {
        max: 2000,
        min: 0,
    };

    let opacities: number[];
    let intervalId: number;

    function getRandom(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    function getRandomInt(max: number) {
        return Math.floor(getRandom(0, max));
    }

    function getColLeftPX(parentElemWidthPx: number) {
        return getRandomInt(parentElemWidthPx - 16);
    }

    function getRandomChar() {
        const ascii = `0123456789abcdefghijklmnopqrstuvwxyz`;
        const kana = `｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ`;
        const chars = [...ascii.split(""), ...kana.split("")];

        const index = getRandomInt(chars.length);
        return chars[index];
    }

    function getChars(charCount: number) {
        return Array(charCount)
            .fill(null)
            .map(() => getRandomChar());
    }

    function getDelayMS() {
        const { min, max } = delayMS;
        return getRandom(min, max);
    }

    function getSpeedMS() {
        const { min, max } = speedMS;
        return getRandom(min, max);
    }

    function addCharsToCol(col: HTMLElement, charCount: number) {
        const chars = getChars(charCount);
        const colSpans: HTMLElement[] = [];

        chars.forEach((char) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.style.opacity = `0`;
            colSpans.push(span);
            col.append(span);
        });

        colSpans.reverse();

        return colSpans;
    }

    function createCol(leftPX: number) {
        const col = document.createElement("div");
        col.className = "col";
        col.style.left = `${leftPX}px`;

        return col;
    }

    function animateSpans(spans: HTMLElement[]) {
        let colOpacities = [...opacities];

        function start() {
            intervalId = setInterval(() => {
                spans.forEach((span, i) => {
                    span.style.opacity = `${colOpacities[i] || 0}`;
                });

                if (colOpacities.length === 0) {
                    colOpacities = [...opacities];
                } else {
                    colOpacities.shift();
                }
            }, getSpeedMS());
        }

        setTimeout(start, getDelayMS());
    }

    function createMatrix() {
        if (!parentElem) {
            return;
        }

        const parentElemWidthPx = parentElem.getBoundingClientRect().width;
        const charCount = Math.floor(parentElemWidthPx / 12);

        opacities = [
            ...Array(charCount).fill(0),
            ...Array(charCount)
                .fill(null)
                .map((_, i) => 1 - i / charCount),
        ];

        // There always needs to be a column on the left & right edges
        const colLefts = [
            0,
            212,
            ...Array(COL_COUNT - 2)
                .fill(null)
                .map(() => getColLeftPX(parentElemWidthPx)),
        ];
        const cols = colLefts.map((left) => createCol(left));
        const spans = cols.map((col) => addCharsToCol(col, charCount));

        spans.forEach((colSpans) => animateSpans(colSpans));

        parentElem.replaceChildren(...cols);
    }

    function debounce(callback: () => void, waitMS = 200) {
        let timeoutId: number;

        return function (...args: any) {
            // @ts-ignore
            const context = this;

            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                // @ts-ignore
                callback.call(context, ...args);
            }, waitMS);
        };
    }

    const debouncedCreateMatrix = debounce(createMatrix);

    debouncedCreateMatrix();

    window.addEventListener("resize", () => {
        clearInterval(intervalId);
        debouncedCreateMatrix();
    });
})();
