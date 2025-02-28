export async function loadFile(path: string) {
    let stack = new Error().stack;
    let request = new XMLHttpRequest();
    await new Promise((resolve, reject) => {
        request.onload = resolve;
        request.onerror = () => {
            reject(new Error(`Error loading ${path}, ${request.responseText}, stack: ${stack}`));
        };
        request.open("GET", path);
        request.send();
        
    });
    if(request.status !== 200) {
        throw `Load file error for ${path}, error: ${request.statusText}, stack: ${stack}`;
    }
    return request.responseText;
}