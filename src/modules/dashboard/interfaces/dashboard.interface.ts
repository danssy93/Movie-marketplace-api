export interface IAdminDashboard {
  users: {
    total: number;
    total_customers: number;
    total_authors: number;
    new_this_period: number;
  };
  movies: {
    total: number;
    published: number;
    draft: number;
    top_selling: ITopSellingMovie[];
  };
  revenue: {
    platform_balance: number;
    total_revenue: number;
    revenue_this_period: number;
  };
  transactions: {
    total: number;
    successful: number;
    failed: number;
    refunded: number;
    recent: IRecentTransaction[];
  };
}

export interface IAuthorDashboard {
  movies: {
    total: number;
    published: number;
    draft: number;
    list: IAuthorMovie[];
  };
  earnings: {
    wallet_balance: number;
    total_earned: number;
    earned_this_period: number;
  };
  transactions: {
    total: number;
    recent: IRecentTransaction[];
  };
}

export interface ICustomerDashboard {
  wallet: {
    balance: number;
  };
  purchases: {
    total: number;
    recent: IPurchasedMovie[];
  };
  transactions: {
    total: number;
    recent: IRecentTransaction[];
  };
}

export interface ITopSellingMovie {
  id: number;
  title: string;
  total_purchases: number;
  total_revenue: number;
}

export interface IAuthorMovie {
  id: number;
  title: string;
  status: string;
  price: number;
  total_purchases: number;
  total_revenue: number;
}

export interface IPurchasedMovie {
  id: number;
  title: string;
  genre: string;
  price: number;
  purchased_at: Date;
}

export interface IRecentTransaction {
  id: number;
  customer_name: string;
  movie_title: string;
  amount: number;
  status: string;
  created_at: Date;
}
