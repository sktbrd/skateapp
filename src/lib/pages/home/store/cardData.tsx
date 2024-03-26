interface Card {
    imageUrl: string;
    subtitle: string;
    url?: string;
    hoverImageUrl?: string;
    price?: string;
}

const cardData: Card[] = [
    {
        imageUrl: '/assets/lojabless/camisablesspreta1.jpg',
        hoverImageUrl: '/assets/lojabless/camisablesspreta.jpg', // Specify hover image URL
        subtitle: 'Camisa Bless Preta',
        url: '',
        price: 'Valor: R$90,00'
    },
    {
        imageUrl: '/assets/lojabless/camisablessskateshoppreta.jpg',
        subtitle: 'Camisa Bless Skateshop Preta',
        price: 'Valor: R$90,00'
    },

    {
        imageUrl: '/assets/lojabless/camisablessskateshopazulmarinhho.jpg',
        subtitle: 'Camisa Bless Skateshop Azul-marinho',
        price: 'Valor: R$90,00'
    },
    {
        imageUrl: '/assets/lojabless/calcajeansclara.jpg',
        hoverImageUrl: '/assets/lojabless/calcajeansclara1.jpg', // Specify hover image URL
        subtitle: 'Calça Cargo Jeans Claro',
        price: 'Valor: R$120,00'
    },
    {
        imageUrl: '/assets/lojabless/calcajeansescura.jpg',
        hoverImageUrl: '/assets/lojabless/calcajeansescura1.jpg', // Specify hover image URL
        subtitle: 'Calça Cargo Jeans Escuro',
        price: 'Valor: R$120,00'
    },
    {
        imageUrl: '/assets/lojabless/calcaverde.jpg',
        hoverImageUrl: '/assets/lojabless/calcaverde1.jpg', // Specify hover image URL
        subtitle: 'Calça Cargo Verde',
        price: 'Valor: R$120,00'
    },
    {
        imageUrl: '/assets/lojabless/calcamarrom.jpg',
        hoverImageUrl: '/assets/lojabless/calcamarrom1.jpg', // Specify hover image URL
        subtitle: 'Calça Cargo Marrom',
        price: 'Valor: R$120,00'
    },
    
];

export default cardData;