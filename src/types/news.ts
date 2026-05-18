export interface News{
    news_id: number,
    title: string,
    description: string,
    image_url?: string,
    is_important: boolean,
    user_id: number,
    news_type_id: number,
    createdAt: string,
      author?: {          
    username: string;
  };
}


export interface updateNews{
    
    title: string,
    description: string,
    image_url?: string,
    is_important: boolean,
    news_type_id: number,
    
}


export interface createNews{
    
    title: string,
    description: string,
    image_url?: string,
    is_important: boolean,
    news_type_id: number,
    
}