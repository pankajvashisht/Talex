export const localData = (key, value) => {
    window.localStorage.setItem(key,JSON.stringify(value));
}
export const getData = (key) => {
    const data = window.localStorage.getItem(key);
    if(data !== undefined || data!== null || data !== ''){
        return JSON.parse(data);
    }else{
        return false;
    }
}

export const checkAuth = (key) => {
    const data = window.localStorage.getItem(key);
    if(data !== undefined && data!== null && data !== ''){
        return true;
    }else{
        return false;
    }
}

export const token = (key) => {
    const data = window.localStorage.getItem(key);
    if(data !== undefined && data!== null && data !== ''){
        let info = JSON.parse(data);
        return info.token;
    }else{
        return null;
    }
}