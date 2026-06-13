import { getMilo } from './miloImages';

export interface Quest {
  title: string;
  mascot: ReturnType<typeof getMilo>;
  speech: string[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  rewardXP: number;
  steps: string[];
}

export const QUESTS: Record<string, Quest> = {
  morning_launchpad: {
    title: 'Morning Launchpad',
    mascot: getMilo('morning_launchpad'),
    speech: ['Good morning explorer!', "Let's get ready for today's adventure!"],
    theme: { primary: '#FFD166', secondary: '#FFB347', accent: '#FF9F43', background: '#FFF9F2' },
    rewardXP: 25,
    steps: ['Wake up', 'Fold your blanket', 'Get dressed', 'Wear your shoes'],
  },

  dental_sparkle: {
    title: 'Brush & Sparkle',
    mascot: getMilo('dental_sparkle'),
    speech: ['Time to make our smile sparkle!', 'Brush every tooth carefully.'],
    theme: { primary: '#BDE0FE', secondary: '#89C2FF', accent: '#4EA8DE', background: '#F2FAFF' },
    rewardXP: 20,
    steps: ['Put toothpaste on brush', 'Brush top teeth', 'Brush bottom teeth', 'Brush chewing surfaces', 'Rinse mouth'],
  },

  backpack_pack: {
    title: 'Backpack Checklist',
    mascot: getMilo('backpack_pack'),
    speech: ["Let's pack everything we need!"],
    theme: { primary: '#D9F99D', secondary: '#86EFAC', accent: '#10AC84', background: '#F2FFF9' },
    rewardXP: 20,
    steps: ['Find your backpack', 'Pack school diary', 'Pack assignments', 'Pack pencil case', 'Zip your backpack'],
  },

  lunchbox_ready: {
    title: 'Lunchbox Assembly',
    mascot: getMilo('lunchbox_ready'),
    speech: ["Fuel for today's adventure!"],
    theme: { primary: '#FECACA', secondary: '#FCA5A5', accent: '#FF6B6B', background: '#FFFEF2' },
    rewardXP: 20,
    steps: ['Open lunchbox', 'Add snack', 'Add meal', 'Add water bottle', 'Put lunchbox in bag'],
  },

  shoes_on: {
    title: 'Shoe & Coat Armor',
    mascot: getMilo('shoes_on'),
    speech: ['Time to wear our explorer armor!'],
    theme: { primary: '#FFE29A', secondary: '#FFD166', accent: '#FF9F43', background: '#FFF9F2' },
    rewardXP: 15,
    steps: ['Put on socks', 'Wear shoes', 'Tie laces', 'Wear jacket'],
  },

  bedtime_winddown: {
    title: 'Bedtime Slowdown',
    mascot: getMilo('bedtime_winddown'),
    speech: ["Let's prepare for sweet dreams."],
    theme: { primary: '#DDD6FE', secondary: '#C4B5FD', accent: '#7457F1', background: '#F6F2FF' },
    rewardXP: 20,
    steps: ['Change into pajamas', 'Put dirty clothes away', 'Turn off bright lights', 'Get into bed'],
  },

  clean_room: {
    title: 'Room Ranger Duty',
    mascot: getMilo('clean_room'),
    speech: ["Let's make your room shine!"],
    theme: { primary: '#FBCFE8', secondary: '#F9A8D4', accent: '#FF6B8B', background: '#FFF2F5' },
    rewardXP: 35,
    steps: ['Pick toys from floor', 'Put toys in bins', 'Place books on shelf', 'Check room one last time'],
  },

  wash_dishes: {
    title: 'Dish Bubble Splash',
    mascot: getMilo('wash_dishes'),
    speech: ['Bubble mission activated!'],
    theme: { primary: '#A5F3FC', secondary: '#67E8F9', accent: '#00D2D3', background: '#F2FFFF' },
    rewardXP: 30,
    steps: ['Bring dishes to sink', 'Rinse dishes', 'Wash with soap', 'Place on drying rack'],
  },

  do_laundry: {
    title: 'Laundry Sorting',
    mascot: getMilo('do_laundry'),
    speech: ['Sorting challenge begins!'],
    theme: { primary: '#BFDBFE', secondary: '#93C5FD', accent: '#54A0FF', background: '#F2F7FF' },
    rewardXP: 25,
    steps: ['Collect dirty clothes', 'Separate dark clothes', 'Separate light clothes', 'Place clothes in baskets'],
  },

  fold_clothes: {
    title: 'Wardrobe Origami',
    mascot: getMilo('fold_clothes'),
    speech: ["Let's fold like a pro!"],
    theme: { primary: '#FBCFE8', secondary: '#F9A8D4', accent: '#FF6B8B', background: '#FFF2F5' },
    rewardXP: 30,
    steps: ['Lay shirt flat', 'Fold sleeves inward', 'Fold shirt neatly', 'Place in drawer'],
  },

  empty_trash: {
    title: 'Trash Bin Patrol',
    mascot: getMilo('empty_trash'),
    speech: ['Cleanup mission activated!'],
    theme: { primary: '#A5F3FC', secondary: '#67E8F9', accent: '#00D2D3', background: '#F2FFFF' },
    rewardXP: 25,
    steps: ['Tie trash bag', 'Carry carefully', 'Put in main bin', 'Return empty bin'],
  },

  plant_care: {
    title: 'Botanical Guardian',
    mascot: getMilo('plant_care'),
    speech: ["Let's help our plants grow!"],
    theme: { primary: '#BBF7D0', secondary: '#86EFAC', accent: '#10AC84', background: '#F2FFF9' },
    rewardXP: 20,
    steps: ['Find watering can', 'Fill with water', 'Water each plant', 'Return watering can'],
  },

  basic_cooking: {
    title: 'Snack Master Chef',
    mascot: getMilo('basic_cooking'),
    speech: ['Chef Milo reporting for duty!'],
    theme: { primary: '#FFE29A', secondary: '#FFD166', accent: '#FF9F43', background: '#FFF9F2' },
    rewardXP: 35,
    steps: ['Gather ingredients', 'Prepare snack safely', 'Put ingredients away', 'Enjoy your snack'],
  },

  set_table: {
    title: 'Table Layout Design',
    mascot: getMilo('set_table'),
    speech: ["Let's prepare for dinner!"],
    theme: { primary: '#FECACA', secondary: '#FCA5A5', accent: '#FF6B6B', background: '#FFFEF2' },
    rewardXP: 25,
    steps: ['Place placemats', 'Place forks', 'Place spoons', 'Place cups'],
  },

  wipe_counters: {
    title: 'Countertop Cruiser',
    mascot: getMilo('wipe_counters'),
    speech: ["Let's make the kitchen sparkle!"],
    theme: { primary: '#A5F3FC', secondary: '#67E8F9', accent: '#00D2D3', background: '#F2FFFF' },
    rewardXP: 20,
    steps: ['Get cloth', 'Wipe crumbs', 'Clean spills', 'Check countertop'],
  },

  buy_something: {
    title: 'Shopkeeper Checkout',
    mascot: getMilo('buy_something'),
    speech: ['Practice being a confident shopper!'],
    theme: { primary: '#BBF7D0', secondary: '#86EFAC', accent: '#10AC84', background: '#F2FFF9' },
    rewardXP: 40,
    steps: ['Greet cashier', 'Hand over item', 'Pay politely', 'Say thank you'],
  },

  phone_call: {
    title: 'Phone Call Connect',
    mascot: getMilo('phone_call'),
    speech: ["Let's practice talking on the phone!"],
    theme: { primary: '#DDD6FE', secondary: '#C4B5FD', accent: '#7457F1', background: '#F6F2FF' },
    rewardXP: 35,
    steps: ['Dial number', 'Say hello', 'Have conversation', 'Say goodbye'],
  },

  ask_directions: {
    title: 'Information Seeker',
    mascot: getMilo('ask_directions'),
    speech: ["Let's practice asking for help!"],
    theme: { primary: '#BFDBFE', secondary: '#93C5FD', accent: '#54A0FF', background: '#F2F7FF' },
    rewardXP: 35,
    steps: ['Approach employee', 'Say excuse me', 'Ask your question', 'Say thank you'],
  },

  cool_down: {
    title: 'Reset Button',
    mascot: getMilo('cool_down'),
    speech: ['Big feelings are okay.'],
    theme: { primary: '#DDD6FE', secondary: '#C4B5FD', accent: '#7457F1', background: '#F6F2FF' },
    rewardXP: 15,
    steps: ['Take a deep breath', 'Take another breath', 'Look around calmly', 'Check how you feel'],
  },

  screen_timer: {
    title: 'Device Disconnect',
    mascot: getMilo('screen_timer'),
    speech: ['Great job taking a screen break!'],
    theme: { primary: '#FECACA', secondary: '#FCA5A5', accent: '#FF6B6B', background: '#FFFEF2' },
    rewardXP: 20,
    steps: ['Save your game', 'Turn off screen', 'Put device away', 'Choose another activity'],
  },

  wash_hands: {
    title: 'Suds & Scrub',
    mascot: getMilo('wash_hands'),
    speech: ['Bubble power activated!'],
    theme: { primary: '#BDE0FE', secondary: '#89C2FF', accent: '#4EA8DE', background: '#F2FAFF' },
    rewardXP: 15,
    steps: ['Wet hands', 'Apply soap', 'Scrub 20 seconds', 'Rinse hands', 'Dry hands'],
  },

  take_shower: {
    title: 'Shower Spaceship',
    mascot: getMilo('take_shower'),
    speech: ['Ready for a fresh start!'],
    theme: { primary: '#BFDBFE', secondary: '#93C5FD', accent: '#54A0FF', background: '#F2F7FF' },
    rewardXP: 40,
    steps: ['Turn on water', 'Wash hair', 'Wash body', 'Rinse', 'Dry off'],
  },

  // ── Safety Awareness ───────────────────────────────────────────
  safety_trusted_adults: {
    title: 'Safety Squad',
    mascot: getMilo('safety_trusted_adults'),
    speech: ["Let's find your safety helpers!", 'Knowing your trusted grown-ups keeps you strong.'],
    theme: { primary: '#BFDBFE', secondary: '#93C5FD', accent: '#3B82F6', background: '#F2F7FF' },
    rewardXP: 35,
    steps: [
      'Name a grown-up you trust',
      'Name one more trusted grown-up',
      'Learn how to reach them',
      "Practice saying 'I need help'",
    ],
  },

  safety_boundaries: {
    title: 'My Body, My Rules',
    mascot: getMilo('safety_boundaries'),
    speech: ['Your body belongs to you!', "It's always okay to say no."],
    theme: { primary: '#A7F3D0', secondary: '#6EE7B7', accent: '#059669', background: '#F2FFF9' },
    rewardXP: 40,
    steps: [
      'My body belongs to me',
      "It's okay to say 'No' or 'Stop'",
      'Learn which parts are private',
      'Tell a trusted grown-up if something feels wrong',
    ],
  },

  safety_digital: {
    title: 'Online Explorer Shield',
    mascot: getMilo('safety_digital'),
    speech: ["Let's stay smart and safe online!", "You're a careful online explorer."],
    theme: { primary: '#C7D2FE', secondary: '#A5B4FC', accent: '#6366F1', background: '#F4F2FF' },
    rewardXP: 35,
    steps: [
      'Ask a grown-up before going online',
      'Keep your name and address private',
      'Never chat with strangers',
      'Tell a grown-up if something feels wrong',
    ],
  },

  // ── Independence Skills ────────────────────────────────────────
  independence_shopping: {
    title: 'Market Mission',
    mascot: getMilo('independence_shopping'),
    speech: ['Time to be a shopping pro!'],
    theme: { primary: '#BBF7D0', secondary: '#86EFAC', accent: '#10AC84', background: '#F2FFF9' },
    rewardXP: 40,
    steps: ['Read your shopping list', 'Find each item on the shelf', 'Place items in the cart', 'Head to the checkout'],
  },

  independence_money: {
    title: 'Coin Counter',
    mascot: getMilo('independence_money'),
    speech: ["Let's learn about money!"],
    theme: { primary: '#FDE68A', secondary: '#FCD34D', accent: '#F59E0B', background: '#FFFBEB' },
    rewardXP: 35,
    steps: ['Look at your coins', 'Count how much you have', 'Pick what you can buy', 'Save the rest in your piggy bank'],
  },

  independence_ordering: {
    title: 'Order Hero',
    mascot: getMilo('independence_ordering'),
    speech: ["Let's practice ordering food!"],
    theme: { primary: '#FED7AA', secondary: '#FDBA74', accent: '#FB923C', background: '#FFF7ED' },
    rewardXP: 35,
    steps: ['Read the menu', 'Decide what you want', 'Order politely and clearly', 'Say thank you'],
  },
};
