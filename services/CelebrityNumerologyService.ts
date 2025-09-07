// Celebrity Numerology Service - Famous people by birth numbers
export interface Celebrity {
  name: string;
  birthDate: string;
  lifePathNumber: number;
  destinyNumber?: number;
  profession: string;
  achievements: string;
  quote?: string;
}

export class CelebrityNumerologyService {
  
  // Famous celebrities organized by Life Path Numbers
  private static readonly CELEBRITIES_BY_LIFE_PATH: { [key: number]: Celebrity[] } = {
    1: [
      {
        name: "Oprah Winfrey",
        birthDate: "01/29/1954",
        lifePathNumber: 1,
        profession: "Media Mogul & Philanthropist",
        achievements: "First African-American billionaire woman, influential talk show host",
        quote: "The biggest adventure you can take is to live the life of your dreams."
      },
      {
        name: "Lady Gaga",
        birthDate: "03/28/1986",
        lifePathNumber: 1,
        profession: "Singer & Actress",
        achievements: "Grammy, Oscar, and Golden Globe winner",
        quote: "Do not allow people to dim your shine because they are blinded."
      },
      {
        name: "Tom Hanks",
        birthDate: "07/09/1956",
        lifePathNumber: 1,
        profession: "Actor & Producer",
        achievements: "Two-time Academy Award winner, beloved American icon",
        quote: "Life is like a box of chocolates. You never know what you're gonna get."
      },
      {
        name: "Martin Luther King Jr.",
        birthDate: "01/15/1929",
        lifePathNumber: 1,
        profession: "Civil Rights Leader",
        achievements: "Nobel Peace Prize winner, changed American society",
        quote: "I have a dream that one day this nation will rise up."
      }
    ],
    2: [
      {
        name: "Jennifer Aniston",
        birthDate: "02/11/1969",
        lifePathNumber: 2,
        profession: "Actress & Producer",
        achievements: "Emmy and Golden Globe winner, Friends icon",
        quote: "The best way to enjoy your job is to imagine yourself without one."
      },
      {
        name: "Mozart",
        birthDate: "01/27/1756",
        lifePathNumber: 2,
        profession: "Classical Composer",
        achievements: "Child prodigy, composed over 600 works",
        quote: "Music is my language."
      },
      {
        name: "Barack Obama",
        birthDate: "08/04/1961",
        lifePathNumber: 2,
        profession: "Former US President",
        achievements: "44th President, Nobel Peace Prize winner",
        quote: "Yes we can."
      },
      {
        name: "Diana Princess of Wales",
        birthDate: "07/01/1961",
        lifePathNumber: 2,
        profession: "Royal & Humanitarian",
        achievements: "People's Princess, humanitarian work worldwide",
        quote: "Carry out a random act of kindness with no expectation of reward."
      }
    ],
    3: [
      {
        name: "Will Smith",
        birthDate: "09/25/1968",
        lifePathNumber: 3,
        profession: "Actor & Rapper",
        achievements: "Grammy winner, blockbuster movie star",
        quote: "If you're not making someone else's life better, then you're wasting your time."
      },
      {
        name: "Reese Witherspoon",
        birthDate: "03/22/1976",
        lifePathNumber: 3,
        profession: "Actress & Producer",
        achievements: "Academy Award winner, successful entrepreneur",
        quote: "Never dull your shine for somebody else."
      },
      {
        name: "Jackie Chan",
        birthDate: "04/07/1954",
        lifePathNumber: 3,
        profession: "Actor & Martial Artist",
        achievements: "International action star, innovative stunt performer",
        quote: "Do not let circumstances control you. You change your circumstances."
      },
      {
        name: "Snoop Dogg",
        birthDate: "10/20/1971",
        lifePathNumber: 3,
        profession: "Rapper & Entrepreneur",
        achievements: "Hip-hop legend, successful businessman",
        quote: "If it's flipping hamburgers at McDonald's, be the best hamburger flipper in the world."
      }
    ],
    4: [
      {
        name: "Bill Gates",
        birthDate: "10/28/1955",
        lifePathNumber: 4,
        profession: "Tech Pioneer & Philanthropist",
        achievements: "Microsoft founder, world's richest person, philanthropist",
        quote: "Your most unhappy customers are your greatest source of learning."
      },
      {
        name: "Arnold Schwarzenegger",
        birthDate: "07/30/1947",
        lifePathNumber: 4,
        profession: "Actor & Politician",
        achievements: "Bodybuilding champion, movie star, California Governor",
        quote: "I'll be back."
      },
      {
        name: "Dolly Parton",
        birthDate: "01/19/1946",
        lifePathNumber: 4,
        profession: "Singer & Businesswoman",
        achievements: "Country music icon, successful entrepreneur",
        quote: "Find out who you are and do it on purpose."
      },
      {
        name: "Elton John",
        birthDate: "03/25/1947",
        lifePathNumber: 4,
        profession: "Singer & Composer",
        achievements: "Rock and Roll Hall of Fame, knighted by Queen Elizabeth",
        quote: "Music has healing power. It has the ability to take people out of themselves for a few hours."
      }
    ],
    5: [
      {
        name: "Angelina Jolie",
        birthDate: "06/04/1975",
        lifePathNumber: 5,
        profession: "Actress & Humanitarian",
        achievements: "Academy Award winner, UN Goodwill Ambassador",
        quote: "If you don't get out of the box you've been raised in, you won't understand how much bigger the world is."
      },
      {
        name: "Ryan Gosling",
        birthDate: "11/12/1980",
        lifePathNumber: 5,
        profession: "Actor & Musician",
        achievements: "Academy Award nominee, versatile performer",
        quote: "I think about death a lot, like I think we all do. I don't think of it as an ending, I think of it as a beginning."
      },
      {
        name: "Steven Spielberg",
        birthDate: "12/18/1946",
        lifePathNumber: 5,
        profession: "Film Director",
        achievements: "Three-time Academy Award winner, cinema pioneer",
        quote: "I dream for a living."
      },
      {
        name: "Abraham Lincoln",
        birthDate: "02/12/1809",
        lifePathNumber: 5,
        profession: "US President",
        achievements: "16th President, ended slavery, preserved the Union",
        quote: "Whatever you are, be a good one."
      }
    ],
    6: [
      {
        name: "Meryl Streep",
        birthDate: "06/22/1949",
        lifePathNumber: 6,
        profession: "Actress",
        achievements: "Three-time Academy Award winner, acting legend",
        quote: "The great gift of human beings is that we have the power of empathy."
      },
      {
        name: "John Lennon",
        birthDate: "10/09/1940",
        lifePathNumber: 6,
        profession: "Musician & Peace Activist",
        achievements: "Beatles member, peace advocate, cultural icon",
        quote: "Imagine all the people living life in peace."
      },
      {
        name: "Michael Jackson",
        birthDate: "08/29/1958",
        lifePathNumber: 6,
        profession: "Singer & Entertainer",
        achievements: "King of Pop, best-selling music artist",
        quote: "In a world filled with hate, we must still dare to hope."
      },
      {
        name: "Victoria Beckham",
        birthDate: "04/17/1974",
        lifePathNumber: 6,
        profession: "Fashion Designer & Former Singer",
        achievements: "Spice Girls member, successful fashion entrepreneur",
        quote: "I'm not materialistic. I believe in presents from the heart, like a drawing from a child."
      }
    ],
    7: [
      {
        name: "Leonardo DiCaprio",
        birthDate: "11/11/1974",
        lifePathNumber: 7,
        profession: "Actor & Environmental Activist",
        achievements: "Academy Award winner, environmental advocate",
        quote: "If you can do what you do best and be happy, you're further along in life than most people."
      },
      {
        name: "Marilyn Monroe",
        birthDate: "06/01/1926",
        lifePathNumber: 7,
        profession: "Actress & Model",
        achievements: "Hollywood icon, cultural phenomenon",
        quote: "Imperfection is beauty, madness is genius and it's better to be absolutely ridiculous than absolutely boring."
      },
      {
        name: "Stephen King",
        birthDate: "09/21/1947",
        lifePathNumber: 7,
        profession: "Author",
        achievements: "Master of horror fiction, bestselling author",
        quote: "Get busy living or get busy dying."
      },
      {
        name: "Julia Roberts",
        birthDate: "10/28/1967",
        lifePathNumber: 7,
        profession: "Actress",
        achievements: "Academy Award winner, America's Sweetheart",
        quote: "You know it's love when all you want is that person to be happy, even if you're not part of their happiness."
      }
    ],
    8: [
      {
        name: "Madonna",
        birthDate: "08/16/1958",
        lifePathNumber: 8,
        profession: "Singer & Businesswoman",
        achievements: "Queen of Pop, reinvented pop music multiple times",
        quote: "Express yourself, don't repress yourself."
      },
      {
        name: "Pablo Picasso",
        birthDate: "10/25/1881",
        lifePathNumber: 8,
        profession: "Artist",
        achievements: "Revolutionary artist, co-founder of Cubism",
        quote: "Everything you can imagine is real."
      },
      {
        name: "Sandra Bullock",
        birthDate: "07/26/1964",
        lifePathNumber: 8,
        profession: "Actress & Producer",
        achievements: "Academy Award winner, highest-paid actress",
        quote: "I'm a true believer in karma. You get what you give, whether it's bad or good."
      },
      {
        name: "Nelson Mandela",
        birthDate: "07/18/1918",
        lifePathNumber: 8,
        profession: "Political Leader & Activist",
        achievements: "Nobel Peace Prize winner, ended apartheid",
        quote: "It always seems impossible until it's done."
      }
    ],
    9: [
      {
        name: "Mahatma Gandhi",
        birthDate: "10/02/1869",
        lifePathNumber: 9,
        profession: "Spiritual Leader & Activist",
        achievements: "Led India to independence through non-violence",
        quote: "Be the change you wish to see in the world."
      },
      {
        name: "Mother Teresa",
        birthDate: "08/26/1910",
        lifePathNumber: 9,
        profession: "Missionary & Humanitarian",
        achievements: "Nobel Peace Prize winner, served the poor",
        quote: "Spread love everywhere you go. Let no one ever come to you without leaving happier."
      },
      {
        name: "Jim Carrey",
        birthDate: "01/17/1962",
        lifePathNumber: 9,
        profession: "Actor & Comedian",
        achievements: "Comedy legend, inspirational speaker",
        quote: "Your need for acceptance can make you invisible in this world."
      },
      {
        name: "Elvis Presley",
        birthDate: "01/08/1935",
        lifePathNumber: 9,
        profession: "Singer & Actor",
        achievements: "King of Rock and Roll, cultural icon",
        quote: "Truth is like the sun. You can shut it out for a time, but it ain't goin' away."
      }
    ],
    11: [
      {
        name: "Barack Obama",
        birthDate: "08/04/1961",
        lifePathNumber: 11,
        profession: "Former US President",
        achievements: "44th President, Nobel Peace Prize winner",
        quote: "Change will not come if we wait for some other person or some other time."
      },
      {
        name: "Jennifer Lopez",
        birthDate: "07/24/1969",
        lifePathNumber: 11,
        profession: "Singer, Actress & Businesswoman",
        achievements: "Multi-talented entertainer, successful entrepreneur",
        quote: "You've got to love yourself first. You've got to be okay on your own before you can be okay with somebody else."
      },
      {
        name: "Prince",
        birthDate: "06/07/1958",
        lifePathNumber: 11,
        profession: "Musician & Artist",
        achievements: "Musical genius, sold over 100 million records",
        quote: "A strong spirit transcends rules."
      }
    ],
    22: [
      {
        name: "Oprah Winfrey",
        birthDate: "01/29/1954",
        lifePathNumber: 22,
        profession: "Media Mogul & Philanthropist",
        achievements: "Built media empire, influential philanthropist",
        quote: "The biggest adventure you can take is to live the life of your dreams."
      },
      {
        name: "Sir Richard Branson",
        birthDate: "07/18/1950",
        lifePathNumber: 22,
        profession: "Entrepreneur",
        achievements: "Virgin Group founder, space tourism pioneer",
        quote: "Business opportunities are like buses, there's always another one coming."
      },
      {
        name: "Will Smith",
        birthDate: "09/25/1968",
        lifePathNumber: 22,
        profession: "Actor & Producer",
        achievements: "Global superstar, successful in multiple fields",
        quote: "If you're not making someone else's life better, then you're wasting your time."
      }
    ]
  };

  // Get celebrities with the same life path number
  static getCelebritiesByLifePath(lifePathNumber: number): Celebrity[] {
    return this.CELEBRITIES_BY_LIFE_PATH[lifePathNumber] || [];
  }

  // Get a random selection of celebrities for a given life path
  static getRandomCelebrities(lifePathNumber: number, count: number = 3): Celebrity[] {
    const celebrities = this.getCelebritiesByLifePath(lifePathNumber);
    if (celebrities.length <= count) return celebrities;
    
    // Shuffle and return random selection
    const shuffled = [...celebrities].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Get celebrity statistics for a life path number
  static getLifePathStats(lifePathNumber: number): {
    totalCelebrities: number;
    topProfessions: string[];
    commonTraits: string[];
  } {
    const celebrities = this.getCelebritiesByLifePath(lifePathNumber);
    
    // Count professions
    const professionCounts: { [key: string]: number } = {};
    celebrities.forEach(celeb => {
      const mainProfession = celeb.profession.split(' ')[0];
      professionCounts[mainProfession] = (professionCounts[mainProfession] || 0) + 1;
    });
    
    // Get top professions
    const topProfessions = Object.entries(professionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([profession]) => profession);

    // Define common traits by life path number
    const traitsByLifePath: { [key: number]: string[] } = {
      1: ["Leadership", "Independence", "Innovation", "Ambition"],
      2: ["Cooperation", "Diplomacy", "Sensitivity", "Peace-making"],
      3: ["Creativity", "Communication", "Optimism", "Artistic talent"],
      4: ["Stability", "Hard work", "Practicality", "Organization"],
      5: ["Freedom", "Adventure", "Versatility", "Change"],
      6: ["Nurturing", "Responsibility", "Service", "Family focus"],
      7: ["Spirituality", "Analysis", "Intuition", "Introspection"],
      8: ["Material success", "Authority", "Business acumen", "Recognition"],
      9: ["Humanitarianism", "Compassion", "Universal love", "Wisdom"],
      11: ["Inspiration", "Intuition", "Spiritual insight", "Idealism"],
      22: ["Master building", "Large-scale vision", "Practical idealism", "Global impact"]
    };

    return {
      totalCelebrities: celebrities.length,
      topProfessions,
      commonTraits: traitsByLifePath[lifePathNumber] || []
    };
  }
}