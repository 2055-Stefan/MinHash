const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("x-api-key", "");
myHeaders.append("Cookie", "-Cookie-");

const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};

fetch("https://www.skilldisplay.eu/api/v1/skillset/1096", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));