import React from 'react';
import "./base.scss";
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import App from "./App/App";
import {BrowserRouter} from "react-router-dom";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {MuiThemeProvider} from "@material-ui/core";
import {SimplePaletteColorOptions} from "@material-ui/core/styles";
import ReactGA from "react-ga";
import * as Sentry from "@sentry/browser";

require('es6-promise').polyfill();
const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

const primary: SimplePaletteColorOptions = {
	main: "#000",
	contrastText: "#FFFFFF",
	dark: "#222",
	light: "#EEE",
};

const secondary: SimplePaletteColorOptions = {
	main: "#FFF",
	contrastText: "#000",
	dark: "#EEE",
	light: "#222",
};

const theme = createMuiTheme({
	palette: {
		primary,
		secondary,
	},
});

Sentry.init({
	dsn: "https://6d23e717863b4e2e9870dad240f4e965@o377988.ingest.sentry.io/5200785",
	beforeSend: (event, hint) =>
	{
		let discard = false;

		if (event.message?.includes("ceCurrentVideo.currentTime")
			|| event.message?.includes("chrome-extension"))
		{
			discard = true;
		}

		if(event.breadcrumbs?.some(a => a.data?.url?.includes("analytics")))
		{
			discard = true;
		}

		if (discard)
		{
			return null;
		}

		return event;
	}
});

ReactGA.initialize('UA-23730353-5', {
	debug: location.hostname.includes("local") || location.hostname.includes("beta")
});
ReactGA.pageview(window.location.pathname + window.location.search);

ReactDOM.render(
	<BrowserRouter>
		<MuiThemeProvider theme={theme}>
			<App/>
		</MuiThemeProvider>
	</BrowserRouter>
	, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();