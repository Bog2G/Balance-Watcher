let timer = {}
chrome.tabs.onActivated.addLIstener((tabId) => {
    timer[tabId] = {startTime: new Date()}
    setInterval(() => {
        let elapsed = (new Date() - timer[tabId].startTime) 
        timer[tabId] = {startTime: new Date(), elapsed: elapsed}
    }, 1000)

})

chrome.tabs.onRemoved.addListener((tabId) => {
    clearInterval(timer[tabId].intervalId)
    delete timer[tabId]
});

export default timer;