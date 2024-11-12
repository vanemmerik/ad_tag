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
        if (!pair || !pair.includes('=')) {
            params['&'] = params['&'] || [];
            params['&'].push('No parameter or value provided');
        } else {
            const [key, value] = pair.split('=');
            if (!key) {
                return;
            }
            if (placeholder(value)) {
                params[key] = 'No value provided';
                return;
            }
            if (!params[key]) {
                params[key] = value ? value : 'No value provided';
            } else {
                params[key] += `, ${value ? value : 'No value provided'}`;
            }
        }
    });
    return params;
};

const containsWhiteSpace = (tag) => {
    return /\s/.test(tag);
}

const placeholder = (parameter) => {
    return /\[.*?\]/g.test(parameter);
}

const duplicateParameters = (adTag) => {
    const queryString = adTag.split('?')[1];
    if (!queryString) return [];

    const params = queryString.split('&');
    const paramCounts = {};
    const duplicates = [];

    params.forEach(param => {
        const key = param.split('=')[0];
        if (paramCounts[key]) {
            paramCounts[key]++;
            if (paramCounts[key] === 2) {
                duplicates.push(key);
            }
        } else {
            paramCounts[key] = 1;
        }
    });

    return duplicates;
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
    // compareAdTags();
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
    if (typeof value !== 'string') {
        return false;
    }
    
    const regex = /%[0-9A-Fa-f]{2}/g;
    const matches = value.match(regex);
    
    return matches !== null;
};

const compareAdTags = () => {
    const adTag1 = document.getElementById('adTag1').value;
    const adTag2 = document.getElementById('adTag2').value;
    const toggle = document.getElementById('tagToggle').checked;

    // Validate ad tags
    if (!adTag1 || (toggle && !adTag2) || !isValidAdTag(adTag1) || (toggle && !isValidAdTag(adTag2))) {
        alertBanner.classList.add('show');
        alertBanner.classList.remove('amber');
        alertBanner.innerText = 'Please enter a valid GAM ad tag';
        setTimeout(() => {
            alertBanner.classList.remove('show');
        }, 3000);
        return;
    } else if (containsWhiteSpace(adTag1) || (toggle && containsWhiteSpace(adTag2))) {
        alertBanner.classList.add('show');
        alertBanner.classList.remove('amber');
        alertBanner.innerText = 'Ad tag contains whitespace';
        setTimeout(() => {
            alertBanner.classList.remove('show');
        }, 3000);
        return;
    } else {
        alertBanner.classList.remove('show');
    }

    // Check for duplicate parameters
    const duplicates1 = duplicateParameters(adTag1);
    const duplicates2 = toggle ? duplicateParameters(adTag2) : [];
    if (duplicates1.length > 0) {
        alertBanner.classList.add('show');
        alertBanner.innerText = `Duplicate parameters found in Ad Tag 1: ${duplicates1.join(', ')}`;
        setTimeout(() => {
            alertBanner.classList.remove('show');
        }, 3000);
        return;
    }
    if (duplicates2.length > 0) {
        alertBanner.classList.add('show');
        alertBanner.innerText = `Duplicate parameters found in Ad Tag 2: ${duplicates2.join(', ')}`;
        setTimeout(() => {
            alertBanner.classList.remove('show');
        }, 3000);
        return;
    }

    const params1 = parseAdTag(adTag1);
    const params2 = toggle ? parseAdTag(adTag2) : {};

    const allKeys = new Set([...Object.keys(params1), ...Object.keys(params2)]);
    const comparisonTable = document.getElementById('comparisonTable').getElementsByTagName('tbody')[0];
    comparisonTable.innerHTML = '';

    for (const key in parameterTooltips) {
        if (parameterTooltips[key]?.mandatory) {
            allKeys.add(key);
        }
    }

    allKeys.forEach(key => {
        const isMandatory = parameterTooltips[key]?.mandatory;
        const isDeprecated = parameterTooltips[key]?.deprecated;

        let val1 = params1[key] || 'Parameter missing',
            val2 = params2[key] || (toggle ? 'Parameter missing' : '');

        const row = comparisonTable.insertRow(),
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

        if (isMandatory && val1 === 'Parameter missing')  {
            row.cells[1].classList.add('no-parameter');
            row.cells[1].innerHTML = `Mandatory - <code class="parameter">${key}</code> parameter missing`;
            paramCell.classList.add('mandatory');
        }
        else if (isMandatory && val1 === 'No value provided'){
            console.log(isMandatory, val1);
            paramCell.classList.add('mandatory');
            row.cells[1].classList.add('no-parameter');
            row.cells[1].innerHTML = `Mandatory - No <code class="parameter">${key}</code> value provided`;
        }
        else if (val1 === 'No value provided'){
            console.log(isMandatory, val1);
            row.cells[1].innerHTML = `No <code class="parameter">${key}</code> value provided`;
        }
        else if(key === '&'){
            paramCell.classList.add('no-value');
            row.cells[1].innerHTML = `Random <code class="parameter">${key}</code> no <code class="parameter">parameter</code> or <code class="parameter">value</code> provided`;
        }

        if (toggle) {
            const displayVal2 = containsURLEncoded(val2) ? val2 : decodeURIComponent(val2);
            row.insertCell(2).textContent = displayVal2;
            if (isMandatory && (val2 === 'Value missing' || val2 === 'Parameter missing' || val2 === `No value provided`)) {
                row.cells[2].classList.add('mandatory');
                row.cells[0].classList.add('mandatory');
                row.cells[2].innerHTML = val2 === 'Value missing' ? `Mandatory - <code class="parameter">${key}</code> value required` :  `Value for <code class="parameter">${key}</code> has not been provided`;
            } else if (!(key in params2)) {
                // console.log(`Key '${key}' is present in Ad Tag 1 but missing in Ad Tag 2.`);
                row.cells[2].innerHTML = `This tag does not feature the <code class="parameter">${key}</code> parameter`
             } else if (val1 === 'Value missing' && val2 !== 'Value missing') {
                //console.log(`Key ${key} is missing in Ad Tag 1 but has a value in Ad Tag 2: ${val2}`);
                row.cells[2].innerHTML = `The <code class="parameter">${key}</code> parameter is present in Ad Tag 2 with value: <strong>${val2}</strong>`;
            } else if (val2 === 'Value missing' || val2 === 'Parameter missing' || val2 === `No value provided`) {
                row.cells[2].innerHTML = val2 === 'Value missing' ? `Mandatory - <code class="parameter">${key}</code> value required` :  `Value for <code class="parameter">${key}</code> has not been provided`;
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