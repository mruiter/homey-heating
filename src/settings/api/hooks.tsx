import React, { Dispatch, SetStateAction } from 'react';
import { sortBy, forEach } from "lodash";
import { IHeatingPlan, IHeatingDevice, IHeatingZone, ICalculatedTemperature } from '../../app/model';
import { planAPI } from './heating';
import { deviceAPI } from './devices';
import { settingsAPI, SettingsHashMap } from './settings';

import { zoneAPI } from './zones';
import * as uuidv1 from 'uuid/v1';

/***
 * Call the apiMethod asynchronously. 
 * 
 * If the method fails, throw the exception inside set SetStateAction of the hook. 
 * This allows to catch the error "in the ErrorBoundary."
 */
async function tryApiMethod<T>(apiMethod: () => Promise<T>, setStateAction: Dispatch<SetStateAction<T>>): Promise<T> {
    try { 
        setStateAction(await apiMethod()); 
    }
    catch (e) {
        debugger

        // required for the error to popup the hierarchy
        setStateAction (t => { throw e; });
    }

    // not reached
    return null;
}

export const usePlans = () => {
    const [plans, setPlans] = React.useState<IHeatingPlan[]>([]);

    const loadPlans = async () => {
        await tryApiMethod(async () => sortBy(await planAPI.fetchPlans(), p => p.name), setPlans);
    }

    React.useEffect(() => {
        loadPlans();
    }, []);

    return { plans, loadPlans };
}

export const usePlan =  (id?: string) => {
    const [plan, setPlan] = React.useState<IHeatingPlan>({
        id: "",
        name: "",
        enabled: false,
        schedule: [],
        zones: [],
        devices: []
    });

    const loadPlan = async (id?: string) => {
        // new case
        if (id == null) {
            setPlan((old) => { return { ...old, id: uuidv1() } });
            return;
        }

        await tryApiMethod(async () => await planAPI.fetchPlanById(id), setPlan);
    }

    React.useEffect(() => {
        loadPlan(id);
    }, [id]);

    return { plan, setPlan, loadPlan };
}

export const useDevices = () => {
    const [devices, setDevices] = React.useState<ArrayLike<IHeatingDevice>>([]);

    const loadDevices = async () => {
        await tryApiMethod(deviceAPI.fetchHeatingDevices, setDevices);
    }

    React.useEffect(() => {
        loadDevices();
    }, []);

    return { devices, loadDevices };
}

export const useZones = () => {
    const [zones, setZones] = React.useState<ArrayLike<IHeatingZone>>([]);

    const loadZones = async () => {
        await tryApiMethod(zoneAPI.fetchHeatingZones, setZones);
    }

    React.useEffect(() => {
        loadZones();
    }, []);

    return { zones, loadZones };
}

export const useSchedules = () => {
    const [schedules, setSchedules] = React.useState<ICalculatedTemperature[]>([]);

    const loadSchedule = async () => {
        await tryApiMethod(planAPI.fetchSchedule, setSchedules);
    }

    React.useEffect(() => {
        loadSchedule();
    }, []);

    return { schedules, loadSchedule };
}

export const useSettings =  () => {
    const [settings, setSettings] = React.useState<SettingsHashMap>({});

    const loadSettings = async () => {
        await tryApiMethod(settingsAPI.fetchSettings, setSettings);
    }

    React.useEffect(() => {
        loadSettings();
    }, []);

    return { settings, setSettings, loadSettings };
}
