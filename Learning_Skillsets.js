const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("x-api-key", "");
myHeaders.append("Cookie", "sd_user_www=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiNTYyMTZmM2MxZDJkMWZlZDkxODM5MmU2Y2RiOTIzYTMiLCJ0aW1lIjoiMjAyNS0xMS0wNFQxMDoyOTowNiswMTowMCIsInNjb3BlIjp7ImRvbWFpbiI6InNraWxsZGlzcGxheS5ldSIsImhvc3RPbmx5IjpmYWxzZSwicGF0aCI6Ii8ifX0.Vupv1m8XGzN46T9VtZnYu1e27jUYOpFn1-ZEIvg08jM");

const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};

fetch("https://www.skilldisplay.eu/api/v1/organisation/1", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));