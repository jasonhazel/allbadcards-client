import React, {ChangeEvent, useState} from "react";
import {Slider, TextField, Typography} from "@material-ui/core";
import {useDataStore} from "../../../Global/Utils/HookUtils";
import {GameDataStore} from "../../../Global/DataStore/GameDataStore";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import {ExpandMore} from "@material-ui/icons";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Divider from "@material-ui/core/Divider";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

const useStyles = makeStyles({
	whiteBox: {
		marginLeft: 20,
		height: "1rem",
		border: "1px solid black",
		padding: 5
	},
	blackBox: {
		padding: 5,
		height: "1rem",
		background: "black",
		border: "1px solid black",
		color: "white",
	}
});

export const GameSettings = () =>
{
	const gameData = useDataStore(GameDataStore);

	const onPacksChange = (event: React.ChangeEvent<HTMLInputElement>) =>
	{
		const newPacks = event.target.checked
			? [...gameData.includedPacks, event.target.name]
			: gameData.includedPacks.filter(a => a !== event.target.name);
		GameDataStore.setIncludedPacks(newPacks);
	};

	const selectDefault = () =>
	{
		GameDataStore.setIncludedPacks(gameData.packs?.slice(0, 20).map(p => p.packId));
	};

	const selectAll = () =>
	{
		GameDataStore.setIncludedPacks(gameData.packs?.map(p => p.packId));
	};

	const selectNone = () =>
	{
		GameDataStore.setIncludedPacks([]);
	};

	const selectOfficial = () =>
	{
		GameDataStore.setIncludedPacks(gameData.packs?.slice(0, 31).map(p => p.packId));
	};

	const selectThirdParty = () =>
	{
		GameDataStore.setIncludedPacks(gameData.packs?.slice(32).map(p => p.packId));
	};

	const classes = useStyles();

	const mobile = useMediaQuery('(max-width:600px)');

	return (
		<div>
			<div style={{marginTop: "1rem"}}>
				<ExpansionPanel>
					<ExpansionPanelSummary
						expandIcon={<ExpandMore/>}
					>
						<Typography>Game</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails style={{display: "block"}}>
						<SliderField/>
						<UrlField/>
					</ExpansionPanelDetails>
				</ExpansionPanel>
				{!gameData.familyMode && (
					<ExpansionPanel>
						<ExpansionPanelSummary
							expandIcon={<ExpandMore/>}
						>
							<Typography>Card Packs</Typography>
						</ExpansionPanelSummary>
						<ExpansionPanelDetails>
							<FormControl component="fieldset">
								<Divider style={{marginBottom: "1rem"}}/>
								<div>
									<ButtonGroup orientation={mobile ? "vertical" : "horizontal"}>
										<Button onClick={selectDefault}>Default</Button>
										<Button onClick={selectAll}>All</Button>
										<Button onClick={selectNone}>None</Button>
										<Button onClick={selectOfficial}>Official Only</Button>
										<Button onClick={selectThirdParty}>Third-Party Only</Button>
									</ButtonGroup>
									<Typography style={{padding: "1rem 0"}}>
										<strong>{gameData.includedPacks?.length ?? 0}</strong> packs selected
									</Typography>
								</div>
								{gameData.packs?.map(pack => (
									<FormGroup key={pack.packId}>
										<FormControlLabel
											control={
												<Checkbox
													color={"primary"}
													checked={gameData.includedPacks.indexOf(pack.packId) > -1}
													onChange={onPacksChange}
													name={pack.packId}/>
											}
											label={
												<div>
													<span>{pack.packName}</span>
													<span className={classes.whiteBox}>{pack.whiteCount}</span>
													<span className={classes.blackBox}>{pack.blackCount}</span>
												</div>
											}
										/>
									</FormGroup>
								))}
							</FormControl>
						</ExpansionPanelDetails>
					</ExpansionPanel>
				)}
			</div>
		</div>
	);
};

let timeout = 0;
const UrlField = () =>
{
	const [url, setUrl] = useState("");
	const [invalid, setInvalid] = useState(false);

	const setOuter = (value: string) =>
	{
		setUrl(value);

		clearTimeout(timeout);
		timeout = window.setTimeout(() =>
		{
			const invalid = value.length > 0 && !value.match(urlRegex);
			setInvalid(invalid);
			if (!invalid)
			{
				GameDataStore.setInviteLink(value);
			}
		}, 500);
	};

	return (
		<FormControl component="fieldset" style={{width: "100%"}}>
			<Divider style={{margin: "1rem 0"}}/>
			<Typography style={{marginBottom: "0.5rem"}}>Chat / Video invite URL</Typography>
			<TextField value={url} label="URL" variant="outlined" onChange={(e) => setOuter(e.target.value)} error={invalid}/>
		</FormControl>
	);
};

let sliderTimeout = 0;
const SliderField = () =>
{
	const gameData = useDataStore(GameDataStore);

	const onChange = (e: ChangeEvent<{}>, v: number | number[]) => {
		clearTimeout(sliderTimeout);
		sliderTimeout = window.setTimeout(() => {
			GameDataStore.setRequiredRounds(v as number)
		}, 500);
	};

	return (
		<FormControl component="fieldset" style={{width: "100%"}}>
			<Divider style={{margin: "1rem 0"}}/>
			<Typography>Rounds required to win: {gameData.roundsRequired}</Typography>
			<Slider
				defaultValue={gameData.roundsRequired}
				onChange={onChange}
				aria-labelledby="discrete-slider"
				valueLabelDisplay="auto"
				step={1}
				marks
				min={1}
				max={50}
			/>
		</FormControl>
	);
};