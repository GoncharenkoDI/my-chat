export default [
  {
    id: 1,
    name: 'room1',
    users: [{ id: 1, roomTitle: 'Вася' }, { id: 2 }],
  },
  {
    id: 2,
    name: 'room2',
    users: [{ id: 1, roomTitle: 'user2' }, { id: 3 }],
  },
  {
    id: 3,
    name: 'room3',
    users: [{ id: 2 }, { id: 3 }],
  },
];
