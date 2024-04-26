interface Card {
    imageUrl: string;
    subtitle: string;
    url?: string;
    hoverImageUrl?: string;
    price?: string;
    preco?: string;
}

const cardData: Card[] = [
    {
        imageUrl: '/assets/lojabless/camisablesspreta1.jpg',
        hoverImageUrl: '/assets/lojabless/camisablesspreta.jpg', // Specify hover image URL
        subtitle: 'Camisa Bless Preta',
        price: 'Valor: R$89,90',
        preco: '19.038'
    },
    {
        imageUrl: '/assets/lojabless/camisablessskateshoppreta.jpg',
        subtitle: 'Camisa Bless Skateshop Preta',
        price: 'Valor: R$89,90',
        preco: '19.038'
    },

    {
        imageUrl: '/assets/lojabless/camisablessskateshopazulmarinhho.jpg',
        subtitle: 'Camisa Bless Skateshop Azul-marinho',
        price: 'Valor: R$89,90',
        preco: '19.038'
    },
    {
        imageUrl: '/assets/lojabless/calcajeansclara.jpg',
        hoverImageUrl: '/assets/lojabless/calcajeansclara1.jpg', // Specify hover image URL
        subtitle: 'Calça Cargo Jeans Claro',
        price: 'Valor: R$179,90',
        preco: '37.875'
    },
    {
        imageUrl: '/assets/lojabless/calcajeansescura.jpg',
        hoverImageUrl: '/assets/lojabless/calcajeansescura1.jpg', // Specify hover image URL
        subtitle: 'Calça Cargo Jeans Escuro',
        price: 'Valor: R$179,90',
        preco: '37.875'
    },
    {
        imageUrl: '/assets/lojabless/calcaverde.jpg',
        hoverImageUrl: '/assets/lojabless/calcaverde1.jpg', // Specify hover image URL
        subtitle: 'Calça Cargo Verde',
        price: 'Valor: R$179,90',
        preco: '37.875'
    },
    {
        imageUrl: '/assets/lojabless/calcamarrom.jpg',
        hoverImageUrl: '/assets/lojabless/calcamarrom1.jpg', // Specify hover image URL
        subtitle: 'Calça Cargo Marrom',
        price: 'Valor: R$179,90',
        preco: '37.875'
    },
    {
        imageUrl: '/assets/lojabless/bermuda.jpg',
        hoverImageUrl: '/assets/lojabless/bermuda1.jpg', // Specify hover image URL
        subtitle: 'Bermuda',
        price: 'Valor: R$289,90',
        preco: '61.323'
    },
    {
        imageUrl: '/assets/lojabless/shapeflor8.jpg',
        hoverImageUrl: '/assets/lojabless/shapeflor8.jpg', // Specify hover image URL
        subtitle: 'Shape Internos colective Flores 8.0/8.25',
        price: 'Valor: R$319,90',
        preco: '67.335'
    },
    {
        imageUrl: '/assets/lojabless/shapeupreto.jpg',
        hoverImageUrl: '/assets/lojabless/shapeupreto.jpg', // Specify hover image URL
        subtitle: 'Shape Internos black 8.25',
        price: 'Valor: R$319,90', 
        preco: '67.335'
    },
    {
        imageUrl: '/assets/lojabless/shapethankyou.jpg',
        hoverImageUrl: '/assets/lojabless/shapethankyou.jpg', // Specify hover image URL
        subtitle: 'Thank You 8.0',
        price: 'Valor: R$299,90',
        preco: '62.725'
    },
    {
        imageUrl: '/assets/lojabless/shapeubranco.jpg',
        hoverImageUrl: '/assets/lojabless/shapeubranco.jpg', // Specify hover image URL
        subtitle: 'Shape Internos colective white 8.0',
        price: 'Valor: R$319,90',
        preco: '67.335'
    },
];

export default cardData;