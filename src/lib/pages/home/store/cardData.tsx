interface Card {
    imageUrl: string;
    subtitle: string;
    url?: string;
    hoverImageUrl?: string;
    price?: string;
}

const cardData: Card[] = [
    {
        imageUrl: '/assets/meias/gota.png',
        hoverImageUrl: '', // Specify hover image URL
        subtitle: 'Gota de Sangue',
        url: '',
        price: 'Valor: 13 🩸 trevosa'
    },
    {
        imageUrl: '/assets/meias/listradabranca.png',
        subtitle: 'Listrada Branca',
        price: 'Valor: 13 🩸 trevosa'
    },

    {
        imageUrl: '/assets/meias/listradesanguebranco.png',
        subtitle: 'Listra de Sangue Branca',
        price: 'Valor: 13 🩸 trevosa'
    },
    {
        imageUrl: '/assets/meias/listradesanguepreto.png',
        subtitle: 'Listra de Sangue Preta',
        price: 'Valor: 13 🩸 trevosa'
    },
    {
        imageUrl: '/assets/meias/listraroxa.png',
        subtitle: 'Listrada Roxa',
        hoverImageUrl: '',
        price: 'Valor: 13 🩸 trevosa'
    },
    {
        imageUrl: '/assets/meias/olhospregados.png',
        subtitle: 'Olhos Pregados',
        url: '',
        hoverImageUrl: '',
        price: 'Valor: 13 🩸 trevosa'
    },
    {
        imageUrl: '/assets/meias/pdsb.png',
        subtitle: 'Pé de Esqueleto Branca',
        price: 'Valor: 13 🩸 trevosa'
    },
    {
        imageUrl: '/assets/meias/pdsp.png',
        subtitle: 'Pé de Esqueleto Preta',
        url: '',
        price: 'Valor: 13 🩸 trevosa'

    },
    {
        imageUrl: '/assets/meias/skate.png',
        subtitle: 'Skate Skate',
        url: '',
        price: 'Valor: 13 🩸 trevosa'

    },
    {
        imageUrl: '/assets/meias/tda.png',
        subtitle: 'Teia de Aranha',
        url: '',
        price: 'Valor: 13 🩸 trevosa'

    },
    {
        imageUrl: '/assets/meias/velalada.png',
        subtitle: 'Vela Alada',
        url: '',
        price: 'Valor: 13 🩸 trevosa'

    },
    {
        imageUrl: '/assets/meias/vermes.png',
        subtitle: 'Vermes Malditos',
        url: '',
        price: 'Valor: 13 🩸 trevosa'

    },

];

export default cardData;