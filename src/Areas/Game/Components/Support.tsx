import {Typography} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import Button from "@material-ui/core/Button";
import {Twemoji} from "react-emoji-render";
import {Platform} from "../../../Global/Platform/platform";

export const Support = () =>
{
	const [randomThankYou, setRandomThankYou] = useState(0);

	useEffect(() => {
		setRandomThankYou(Math.random());
		Platform.trackEvent("saw-support-message");
	}, []);
	
	const thankYous = [
		<a href='https://ko-fi.com/A76217J' target='_blank' onClick={() => Platform.trackEvent("support-link-click", "kofi-coffee")}>
			<img
				height='36'
				style={{border: 0, height: 36, marginTop: "1rem"}}
				src='https://cdn.ko-fi.com/cdn/kofi2.png?v=2'
				alt='Buy Me a Coffee at ko-fi.com'
			/>
		</a>,
		<Button
			variant={"contained"}
			color={"primary"}
			style={{color: "white", textDecoration: "none", marginTop: "1rem", backgroundColor: "#058dc7"}}
			startIcon={<Twemoji text={"☕"}/>}
			onClick={() => Platform.trackEvent("support-link-click", "bmac-coffee")}
			href="https://www.buymeacoffee.com/allbadcards" target="_blank"
		>
			Buy me a coffee 
		</Button>,
	];

	const which = Math.floor(randomThankYou * thankYous.length);
	const thankYouButton = thankYous[which];

	return (
		<div style={{
			marginTop: "3rem",
			textAlign: "center"
		}}>
			<Typography variant={"h5"}>Did you enjoy the game? One dude made this site and it runs on donations!</Typography>
			{thankYouButton}
		</div>
	);
};