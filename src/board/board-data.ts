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
        ctx.fillStyle = entity.__smartColor;
        ctx.fillRect(...entity.px, entity.width, entity.height);
        ctx.fillStyle = level.__smartColor;
        ctx.fillRect(entity.px[0] + 1, entity.px[1] + 1, entity.width - 2, entity.height - 2);

        const next = chain[index + 1];

        const current = {
            left: entity.px[0],
            top: entity.px[1],
            right: entity.px[0] + entity.width,
            bottom: entity.px[1] + entity.height,
        };

        if (next) {
            const after = {
                left: next.px[0],
                top: next.px[1],
                right: next.px[0] + next.width,
                bottom: next.px[1] + next.height,
            };

            if (current.right < after.left) {
                // Going left-to-right
                const minY = Math.max(current.top, after.top) + 1;
                const maxY = Math.min(current.bottom, after.bottom) - 2;

                const y = Math.round(Math.random() * (maxY - minY) + minY);

                ctx.fillStyle = entity.__smartColor;
                ctx.fillRect(current.right, y, after.left - current.right, 1);
            } else if (current.left > after.right) {
                // Going left-to-right
                const minY = Math.max(current.top, after.top) + 1;
                const maxY = Math.min(current.bottom, after.bottom) - 2;

                const y = Math.round(Math.random() * (maxY - minY) + minY);

                ctx.fillStyle = entity.__smartColor;
                ctx.fillRect(after.right, y, current.left - after.right, 1);
            } else if (current.bottom < after.top) {
                // Going top-to-bottom
                const minX = Math.max(current.left, after.left) + 1;
                const maxX = Math.min(current.right, after.right) - 2;

                const x = Math.round(Math.random() * (maxX - minX) + minX);

                ctx.fillStyle = entity.__smartColor;
                ctx.fillRect(x, current.bottom, 1, after.top - current.bottom);
            } else if (current.top > after.bottom) {
                // Going bottom-to-top
                const minX = Math.max(current.left, after.left) + 1;
                const maxX = Math.min(current.right, after.right) - 2;

                const x = Math.round(Math.random() * (maxX - minX) + minX);

                ctx.fillStyle = entity.__smartColor;
                ctx.fillRect(x, after.bottom, 1, current.top - after.bottom);
            }

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
