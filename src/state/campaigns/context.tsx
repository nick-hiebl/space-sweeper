import { type ReactNode, createContext, useContext } from 'react';
import type { Campaign } from './campaign';

const CampaignContext = createContext<Campaign>({} as Campaign);

export const CampaignContextProvider = ({ campaign, children }: { campaign: Campaign, children: ReactNode }) => {
	return <CampaignContext.Provider value={campaign}>{children}</CampaignContext.Provider>;
};

export const useCampaign = (): Campaign => {
	return useContext(CampaignContext);
};
