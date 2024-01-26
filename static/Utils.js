export function decodeJwt(token) {
    var base64Payload = token.split(".")[1];
    var payload = decodeURIComponent(
      atob(base64Payload)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(payload);
  }

  export function getRole(){
    let token = localStorage.getItem('access_token')
    if(!token) return null
    return decodeJwt(token).role
  }

  export function getEmail(){
    let token = localStorage.getItem('access_token')
    if(!token) return null
    return decodeJwt(token).email
  }