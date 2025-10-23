import { Activity } from '../../campaign';

export type PartialRegion = {
    activities: Activity[];
    name: string;
};

export type Region = {
    activities: {
        activity: Activity;
        chosen: boolean;
    }[];
    energy: number;
    name: string;
    nextRegions: PartialRegion[];
};
