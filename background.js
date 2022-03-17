chrome.action.onClicked.addListener((tab) => {
  if(tab.url.includes("nuinvest.com.br/acompanhar/investimentos")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: runScript
    });
  }
});

function runScript() {
    const token = localStorage.getItem('access_token');

    fetch('https://www.nuinvest.com.br/api/samwise/v2/custody-position', {
        method: 'GET',
        headers: {
            'authorization': `Bearer ${token}`
        }
    })
    .then((response) => response.json())
    .then((data) => {
        const cards = document.querySelectorAll('[data-testid="financial-card"]');
        [...cards].map((card, i) => {
            const investment = data.investments[i];

            const lucroPrejuizo = (investment.lastPrice - investment.averagePrice) * investment.quantity;
            const gainLossClass = lucroPrejuizo > 0 ? 'gain' : 'loss';
            
            const newInfo = document.createElement('div');
            newInfo.innerHTML = `
                <div class="new-info ${gainLossClass}">
                    <div>Lucro/Prejuízo: ${format(lucroPrejuizo)}</div>
                </div>
            `
            card.appendChild(newInfo);
        });
    });

    const format = (value) => {
        return value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    }
}
