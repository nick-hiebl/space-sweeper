import type { Board } from './types';

const boardData: Promise<LevelData> = fetch('./space-sweeper.ldtk')
    .then(res => res.json());

export const boardDataPromise = boardData;

boardData.then((data: LevelData) => {
    data.levels.forEach(level => {
        BOARD_MAP.set(level.identifier, drawBoard(level));
    });
});

type LevelData = {
    levels: Level[];
};

type Level = {
    identifier: string;
    pxWid: number;
    pxHei: number;
    layerInstances: Layer[];
    __smartColor: string;
};

type Layer = EntityLayer;

type EntityLayer = {
    __identifier: string;
    entityInstances: Entity[];
};

type Entity = CellEntity;

type EntityCommon = {
    iid: string;
    px: [number, number];
    width: number;
    height: number;
    __smartColor: string;
};

type CellEntity = EntityCommon & {
    __identifier: 'Cell';
    fieldInstances: {
        __identifier: 'Follower';
        __value: null | {
            entityIid: string;
        };
    }[];
};

const buildEntitiesBackwards = (allEntities: Entity[]): Entity[] => {
    const entityMap: Record<string, Entity> = {};
    allEntities.forEach(entity => {
        entityMap[entity.iid] = entity;
    });

    const lastEntity = allEntities.find(entity => !entity.fieldInstances.find(field => field.__identifier === 'Follower' && field.__value !== null));

    if (!lastEntity) {
        console.error(allEntities);
        throw new Error('Cannot find final Cell');
    }

    const chain: Entity[] = [lastEntity];
    
    while (chain.length < allEntities.length) {
        const front = chain[0]!;

        const pointingToFront = allEntities.find(entity => entity.fieldInstances
            .some(follower => follower.__value?.entityIid === front.iid)
        );

        if (!pointingToFront) {
            throw new Error('Cannot find cell pointing to one');
        }

        chain.unshift(pointingToFront);
    }

    return chain;
};

export const drawBoard = (level: Level): Board => {
    const canvas = document.createElement('canvas');
    canvas.width = level.pxWid;
    canvas.height = level.pxHei;

    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
        throw new Error('Could not construct 2d context for canvas');
    }

    ctx.fillStyle = level.__smartColor;
    ctx.fillRect(0, 0, level.pxWid, level.pxHei);

    ctx.imageSmoothingEnabled = true;

    
    const entities: Entity[] = [];

    level.layerInstances.forEach(layer => {
        layer.entityInstances.forEach(entity => {
            entities.push(entity);
        });
    });

    const chain = buildEntitiesBackwards(entities);

    ctx.lineWidth = 1;

    chain.forEach((entity, index) => {
        ctx.strokeStyle = entity.__smartColor;
        ctx.strokeRect(entity.px[0] + 0.5, entity.px[1] + 0.5, entity.width - 1, entity.height - 1);

        const next = chain[index + 1];

        if (next) {
            ctx.beginPath();
            ctx.moveTo(...entity.px);
            ctx.lineTo(...next.px);
            ctx.stroke();
        }
    });

    return {
        dimensions: { width: level.pxWid, height: level.pxHei },
        imageSrc: canvas.toDataURL(),
        cells: chain.map((entity, index) => ({
            position: index,
            offset: { x: entity.px[0], y: entity.px[1] },
            effects: [],
        })),
    };
};

export const BOARD_MAP = new Map<string, Board>();
