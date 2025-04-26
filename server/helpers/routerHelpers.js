function isActiveRoute(route, currentRoute){
    return route ===currentRoute ? 'ative' : '';
}

module.exports = { isActiveRoute}