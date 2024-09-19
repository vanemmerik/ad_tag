const alertBanner = document.querySelector('#alertBanner');

document.addEventListener("DOMContentLoaded", () => {
    populateFromURL();
    loadState();
    document.getElementById('retainToggle').addEventListener('change', saveState);
});

const hasTooltip = (param) => {
    return parameterTooltips.hasOwnProperty(param);
}

const parseAdTag = (url) => {
    const queryString = url.split('?')[1];
    if (!queryString) return {};
    
    const params = {};
    const pairs = queryString.split('&');

    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = value ? value : '';
    });
    return params;
};

const getAdType = (url) => {
    const domain = new URL(url).hostname,
        path = new URL(url).pathname,
        isVOD = domain.includes("serverside"),
        isLive = path.includes("/live/"),
        isCSAI = domain.includes("securepubads.g.doubleclick.net") || domain.includes("pubads.g.doubleclick.net");
    
    if (isLive) {
        return "Live SSAI";
    } else if (isVOD) {
        return "VOD SSAI";
    } else if (isCSAI) {
        return "CSAI";
    }
    return "Unknown Type";
}

const getAdNetwork = (url) => {
    const queryString = url.split('?')[1],
        urlParams = new URLSearchParams(queryString),
        iu = urlParams.get('iu');
    return iu ? iu.split('/')[1] : 'Unknown Network';
}

const isValidAdTag= (url) => {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return urlParams.has('iu') || urlParams.has('gdfp_req') || urlParams.get('output') === 'vast';
}

const toggleTagInputs = () => {
    const toggle = document.getElementById('tagToggle'),
        adTag2Container = document.getElementById('adTag2Container'),
        adTag2Header = document.getElementById('adTag2Header'),
        toggleLabel = document.getElementById('toggleLabel'),
        comparisonTable = document.getElementById('comparisonTable'),
        actionButton = document.getElementById('actionButton');
    
    if (toggle.checked) {
        adTag2Container.classList.remove('hidden');
        adTag2Header.classList.remove('hidden');
        toggleLabel.innerText = "Inspect single ad tag";
        comparisonTable.classList.remove('one-tag');
        comparisonTable.classList.add('two-tags');
        actionButton.innerText = "Compare Ad Tags";
    } else {
        adTag2Container.classList.add('hidden');
        adTag2Header.classList.add('hidden');
        toggleLabel.innerText = "Compare two ad tags";
        comparisonTable.classList.remove('two-tags');
        comparisonTable.classList.add('one-tag');
        actionButton.innerText = "Inspect Ad Tag";
        
        document.getElementById('adTag2Header').classList.add('hidden');
        const rows = document.querySelectorAll('#comparisonTable tbody tr');
        rows.forEach(row => {
            if (row.cells.length === 3) {
                row.deleteCell(2);
            }
        });
    }
}

const saveState = () => {
    const retainToggle = document.getElementById('retainToggle').checked,
        adTag1 = document.getElementById('adTag1').value,
        adTag2 = document.getElementById('adTag2').value,
        tagToggle = document.getElementById('tagToggle').checked;

    if (retainToggle) {
        localStorage.setItem('adTag1', adTag1);
        localStorage.setItem('adTag2', adTag2);
        localStorage.setItem('tagToggle', tagToggle);
        localStorage.setItem('retainToggle', retainToggle);
    }
};

const clearURLQueryParams = () => {
    const urlWithoutQuery = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, urlWithoutQuery);
};

const loadState = () => {
    const retainToggle = localStorage.getItem('retainToggle') === 'true';
    if (retainToggle) {
        const adTag1 = localStorage.getItem('adTag1'),
            adTag2 = localStorage.getItem('adTag2'),
            tagToggle = localStorage.getItem('tagToggle') === 'true';

        document.getElementById('retainToggle').checked = retainToggle;
        document.getElementById('adTag1').value = adTag1 || '';
        document.getElementById('adTag2').value = adTag2 || '';
        document.getElementById('tagToggle').checked = tagToggle;

        toggleTagInputs();
        compareAdTags();
    }
};

const clearState = () => {
    localStorage.removeItem('adTag1');
    localStorage.removeItem('adTag2');
    localStorage.removeItem('tagToggle');
    localStorage.removeItem('retainToggle');
    document.getElementById('adTag1').value = '';
    document.getElementById('adTag2').value = '';
    document.getElementById('tagToggle').checked = false;
    document.getElementById('retainToggle').checked = false;
    document.querySelector('#adTag1Header').innerText = 'Ad Tag 1';
    alertBanner.classList.remove('show');
    clearURLQueryParams();
    toggleTagInputs();
    const comparisonTable = document.getElementById('comparisonTable').getElementsByTagName('tbody')[0];
    comparisonTable.innerHTML = '';

};
const populateFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const adTag1 = params.get('adTag1');
    const adTag2 = params.get('adTag2');

    if (adTag1) {
        document.getElementById('adTag1').value = decodeURIComponent(adTag1);
    }
    if (adTag2) {
        document.getElementById('adTag2').value = decodeURIComponent(adTag2);
        document.getElementById('tagToggle').checked = true;
        toggleTagInputs();
    }

    if (adTag1 || adTag2) {
        compareAdTags();
    }
};

const resetAdTags = () => {
    document.getElementById('adTag1').value = '';
    document.getElementById('adTag2').value = '';
    localStorage.removeItem('adTag1');
    localStorage.removeItem('adTag2');
}

const copyShareLink = () => {
    const adTag1 = encodeURIComponent(document.getElementById('adTag1').value),
        adTag2 = encodeURIComponent(document.getElementById('adTag2').value),
        url = `${window.location.origin}${window.location.pathname}?adTag1=${adTag1}&adTag2=${adTag2}`;
    navigator.clipboard.writeText(url);
    alertBanner.innerText = 'Link copied to clipboard';
    alertBanner.classList.add('show', 'amber');
    setTimeout(() => {
        alertBanner.classList.remove('show');
    }, 3000);
}

const containsURLEncoded = (value) => {
    // console.log(`Checking value: ${value}`);
    const regex = /%[0-9A-Fa-f]{2}/g;
    const matches = value.match(regex);
    
    if (matches) {
        // console.log(`URL-encoded detected in value: ${value}`);
        return true;
    } else {
        // console.log(`No URL-encoded detected in value: ${value}`);
        return false;
    }
};

const compareAdTags = () => {
    const adTag1 = document.getElementById('adTag1').value,
        adTag2 = document.getElementById('adTag2').value,
        toggle = document.getElementById('tagToggle').checked;

    if (!adTag1 || (toggle && !adTag2) || !isValidAdTag(adTag1) || (toggle && !isValidAdTag(adTag2))) {
        alertBanner.classList.add('show');
        alertBanner.classList.remove('amber');
        alertBanner.innerText = 'Please enter a valid GAM ad tag';
        return;
    }
    alertBanner.classList.remove('show');

    const params1 = parseAdTag(adTag1),
        params2 = toggle ? parseAdTag(adTag2) : {},
        adTag1Type = getAdType(adTag1),
        adTag2Type = toggle ? getAdType(adTag2) : '',
        adTag1Network = getAdNetwork(adTag1),
        adTag2Network = toggle ? getAdNetwork(adTag2) : '';

    document.getElementById('adTag1Header').innerText = `Ad Tag 1 (${adTag1Network} - ${adTag1Type})`;
    if (toggle) {
        document.getElementById('adTag2Header').innerText = `Ad Tag 2 (${adTag2Network} - ${adTag2Type})`;
    }

    const allKeys = new Set([...Object.keys(params1), ...Object.keys(params2)]),
        comparisonTable = document.getElementById('comparisonTable').getElementsByTagName('tbody')[0];
    comparisonTable.innerHTML = '';

    allKeys.forEach(key => {
        let val1 = params1.hasOwnProperty(key) ? (params1[key] ? params1[key] : 'Value missing') : 'Parameter missing',
            val2 = params2.hasOwnProperty(key) ? (params2[key] ? params2[key] : 'Value missing') : (toggle ? 'Parameter missing' : ''),
            row = comparisonTable.insertRow(),
            paramCell = row.insertCell(0);

        paramCell.textContent = key;
        if (hasTooltip(key)) {
            const tooltipIcon = document.createElement('span');
            tooltipIcon.classList.add('tooltip');
            tooltipIcon.innerHTML = `<small><strong>&#9432;</strong></small> <span class="tooltiptext">${getTooltipContent(key)}</span>`;
            paramCell.appendChild(tooltipIcon);
        }

        const displayVal1 = containsURLEncoded(val1) ? val1 : decodeURIComponent(val1);
        row.insertCell(1).textContent = displayVal1;

        if (toggle) {
            const displayVal2 = containsURLEncoded(val2) ? val2 : decodeURIComponent(val2);
            row.insertCell(2).textContent = displayVal2;
            const cell1 = row.cells[1],
                cell2 = row.cells[2];
        
            if (val1 === 'Parameter missing' && val2 === 'Value missing') {
                cell1.classList.add('no-parameter');
                cell2.classList.add('no-value');
            } else if (val1 === 'Value missing' && val2 === 'Parameter missing') {
                cell1.classList.add('no-value');
                cell2.classList.add('no-parameter');
            } else if (val1 === val2) {
                cell1.classList.add('same');
                cell2.classList.add('same');
            } else if (val2 === 'Value missing') {
                cell1.classList.add('same');
                cell2.classList.add('no-value');
            } else if (val2 === 'Parameter missing') {
                cell1.classList.add('same');
                cell2.classList.add('no-parameter');
            } else if (val1 === 'Value missing') {
                cell1.classList.add('no-value');
                cell2.classList.add('same');
            } else if (val1 === 'Parameter missing') {
                cell1.classList.add('no-parameter');
                cell2.classList.add('same');
            } else {
                cell1.classList.add('no-value');
                cell2.classList.add('no-value');
            }
        }
    });

    saveState();
};

const getTooltipContent = (param) => {
    const tooltipData = parameterTooltips[param];
    if (tooltipData) {
        let explanationWithFormatting = tooltipData.explination.replace(/\n/g, '<br>');
        explanationWithFormatting = explanationWithFormatting.replace(/```(.*?)```/g, '<code>$1</code>');
        explanationWithFormatting = explanationWithFormatting.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        const content = `<strong class="definition">${tooltipData.definition}</strong><br>${explanationWithFormatting}`;
        return content;
    }
    return '';
}