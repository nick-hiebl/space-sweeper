import { CampaignRegion } from './campaign';

export const drawCampaignMap = (canvas: HTMLCanvasElement, regions: CampaignRegion[][]) => {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    const regionMap = new Map<number, CampaignRegion>();

    regions.flatMap(x => x).forEach(region => regionMap.set(region.id, region));

    ctx.fillStyle = 'rgb(255, 231, 134)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;

    regions.flatMap(x => x).forEach(region => {
        region.validNext.forEach(upper => {
            const upperRegion = regionMap.get(upper);

            if (!upperRegion) {
                return;
            }

            ctx.moveTo(region.x, region.y);
            ctx.lineTo(upperRegion.x, upperRegion.y);
        });
    });

    ctx.stroke();
};
