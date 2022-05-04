chrome.action.onClicked.addListener((tab) => {
  if(tab.url.includes("nuinvest.com.br/acompanhar/investimentos")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: runScript
    });
  }
});

async function runScript() {
    const token = localStorage.getItem('access_token');

    const response = await fetch('https://www.nuinvest.com.br/api/samwise/v2/custody-position', {
        method: 'GET',
        headers: {
            'authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    const cards = document.querySelectorAll('[data-testid="financial-card"]');
    [...cards].map(async (card, i) => {
        const investment = data.investments[i];

        const response = await fetch(`https://www.nuinvest.com.br/api/gringott/averagePrice/${investment.stockCode}`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`
            }
        });

        const averagePrice = await response.json();
        console.log(averagePrice);

        const lucroPrejuizo = (investment.lastPrice - averagePrice.averagePrice) * investment.quantity;
        const gainLossClass = lucroPrejuizo > 0 ? 'gain' : 'loss';
        
        const newInfo = document.createElement('div');
        newInfo.innerHTML = `
            <div class="new-info ${gainLossClass}">
                <div>Lucro/Prejuízo: ${format(lucroPrejuizo)}</div>
            </div>
        `
        card.appendChild(newInfo);
    });
    
    const format = (value) => {
        return value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    }
}
